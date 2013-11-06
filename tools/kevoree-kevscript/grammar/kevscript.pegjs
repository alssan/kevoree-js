/*
 * Kevoree KevScript grammar 
 */

{
  var model = {
    nodes: {},
    groups: {},
    chans: {},
    bindings: [],
    deployUnits: []
  };

  var findEntity = function findEntity(name) {
    var entity = model.nodes[name] || model.groups[name] || model.chans[name] || null;
    if (entity == null) {
      // unable to find entity in nodes, groups and channels, lets check in components
      for (var nodeName in model.nodes) {
        for (var compName in model.nodes[nodeName].components) {
          if (compName == name) return model.nodes[nodeName].components[compName];
        }
      }
      var error = computeErrorPosition();
      throw getErrorPosition()+'Unable to find entity named "'+name+'"';
    }
    return entity;
  };

  var isComponent = function isComponent(name) {
    for (var nodeName in model.nodes) {
      for (var compName in model.nodes[nodeName].components) {
        if (compName == name) return true;
      }
    }
    return false;
  };

  var isChannel = function isChannel(name) {
    return (typeof(model.chans[name]) == 'undefined') ? false : true;
  }

  var isNode = function isNode(name) {
   return (typeof(model.nodes[name]) == 'undefined') ? false : true; 
  }

  var isGroup = function isGroup(name) {
   return (typeof(model.groups[name]) == 'undefined') ? false : true; 
  }

  var getErrorPosition = function getErrorPosition() {
    var error = computeErrorPosition();
    return '[l.'+error.line+' c.'+error.column+'] ';
  };

  var processDictionary = function processDictionary(entity, dictionary) {
    entity.dictionary = entity.dictionary || {};
    for (var i in dictionary) {
      if (typeof(dictionary[i].targetNodeName) == 'undefined') {
        entity.dictionary[dictionary[i].name] = {
          value: dictionary[i].value
        };
      } else {
        entity.dictionary[dictionary[i].name] = {
          value: dictionary[i].value,
          targetNodeName: dictionary[i].targetNodeName
        };
      }
    }
  }
}

// grammar entry-point
start
  = instructions _?
  { return model; }


instructions
  = instruction+


instruction
  = (addEntity / addNodeToGroup / removeNodeFromGroup / updateDictionary / addBinding / merge) _

addEntity
  = entity:(addNode / addComp / addGroup / addChan) dictionary:(_ Dictionary)?
  {
    dictionary = dictionary[1];
    if (typeof(dictionary) != 'undefined') {
      processDictionary(entity, dictionary);
    }
  }

addNode
  =  AddNodeToken _ type:string _ name:string
  {
    model.nodes[name] = {type: type, components: {}};
    return model.nodes[name];
  }


addComp
  =  AddCompToken _ '@' _ nodeName:string _ type:string _ name:string
  {
    model.nodes[nodeName].components[name] = {type: type};
    return model.nodes[nodeName].components[name];
  }


addGroup
  =  AddGroupToken _ type:string _ name:string
  {
    model.groups[name] = {type: type, subnodes: []};
    return model.groups[name];
  }


addChan
  =  AddChanToken _ type:string _ name:string
  {
    model.chans[name] = {type: type};
    return model.chans[name];
  }


addNodeToGroup
  = AddToken _ nodeName:string _ groupName:string
  {
    if (!isNode(nodeName)) throw getErrorPosition()+'You must only add nodes to groups. "'+nodeName+'" is not a node or is not defined.';
    if (!isGroup(groupName)) throw getErrorPosition()+'You must only add nodes to groups. "'+groupName+'" is not a group or is not defined.';
    model.groups[groupName].subnodes.push(nodeName);
  }
  / AddToken _ nodeList:NodeList _ groupName:string
  { 
    if (!isGroup(groupName)) throw getErrorPosition()+'You must only add nodes to groups. "'+groupName+'" is not a group or is not defined.';
    for (var i in nodeList) {
      model.groups[groupName].subnodes.push(nodeList[i]);
    }
  }
  / AddToken _ '*' _ groupName:string
  {
    if (!isGroup(groupName)) throw getErrorPosition()+'You must only add nodes to groups. "'+groupName+'" is not a group or is not defined.';
    for (var nodeName in model.nodes) {
      model.groups[groupName].subnodes.push(nodeName);
    }
  }


removeNodeFromGroup
  = RemoveToken _ nodeName:string _ groupName:string
  {
    var subnodes = model.groups[groupName].subnodes;
    subnodes.splice(subnodes.indexOf(nodeName), 1);
  }
  / RemoveToken _ nodeList:NodeList _ groupName:string
  { 
    var subnodes = model.groups[groupName].subnodes;
    for (var i in nodeList) {
      subnodes.splice(subnodes.indexOf(nodeList[i]), 1);
    }
  }
  / RemoveToken _ '*' _ groupName:string
  { model.groups[groupName].subnodes.length = 0; }

updateDictionary
  = UpdateDictionaryToken _ name:string _ dictionary:Dictionary
  {
    var entity = findEntity(name);
    processDictionary(entity, dictionary);
  }

addBinding
  = compName:string '.' compPort:string _ '=>' _ chanName:string
  {
    if (isComponent(compName) && isChannel(chanName)) {
      model.bindings.push({from: {comp: compName, port: compPort}, to: chanName});
    } else throw getErrorPosition()+'A binding can only be made between a component\'s port and a channel (they must be defined before)';
  }

merge
  = MergeToken _ def:MergeDefinition
  { model.deployUnits.push(def); }
  
MergeDefinition
  = def:(MavenDefinition / NPMDefinition) // TODO add other type of merging possible (local ? etc)
  { return def; }

MavenDefinition
  = 'mvn' _ ':' _ groupId:mergestring _ ':' _ name:mergestring _ ':' _ version:mergestring
  { return {type: 'mvn', name: name, groupId: groupId, version: version}; }

NPMDefinition
  = 'npm' _ ':' _ name:string version:(_ ':' _ mergestring)?
  { return {type: 'npm', name: name, version: version[3]}; }

Dictionary
  = '{' _ first:Attribute others:([,]? _ Attribute)* _ '}'
  {
    var attList = [];
    attList.push(first);
    for (var i=0; i < others.length; i++) {
      attList.push(others[i][2]);
    }
    return attList;
  }

Attribute
  = attName:string _ nodeName:('@' _ string)? _ ':' _ ["'] _ attValue:string _ ["']
  {
    if (typeof(nodeName[2]) != 'undefined') {
      // attribute is fragmentDependant
      return {name: attName, value: attValue, targetNodeName: nodeName[2]};
    } else {
      // attribute is not fragmentDependant
      return {name: attName, value: attValue};
    }
  }

NodeList
  = '[' _ first:string others:([,]? _ string)*  _ ']'
  {
    if (!isNode(first)) throw getErrorPosition()+'"'+first+'" is not a node or is not defined.';
    var nodeList = [];
    nodeList.push(first);
    for (var i=0; i < others.length; i++) {
      if (!isNode(others[i][2])) throw getErrorPosition()+'"'+others[i][2]+'" is not a node or is not defined.';
      nodeList.push(others[i][2]);
    }
    return nodeList;
  }

/* ===== Lexical Elements ===== */
mergestring
  = chars:moarchar+
  { return chars.join(''); }

string
  = chars:char+
  { return chars.join(''); }

AddNodeToken
  = '+node' / '+n' / 'addNode'

DelNodeToken
  = '-node' / '-n' / 'delNode'

AddCompToken
  = '+comp' / '+c' / 'addComp'

DelCompToken
  = '-comp' / '-c' / 'delComp'

AddGroupToken
  = '+grp' / '+g' / 'addGrp' / 'addGroup'

DelGroupToken
  = '-grp' / '-g' / 'delGrp' / 'delGroup'

AddChanToken
  = '+chan' / '+ch' / 'addChan'

DelChanToken
  = '-chan' / '-ch' / 'delChan'

AddToken
  = 'add' / '+'

RemoveToken
  = 'del' / 'remove' / '-'

UpdateDictionaryToken
  = 'updateDictionary' / 'dictionary' / 'dic'

MergeToken
  = 'merge' / '~'

char
  = [a-zA-Z0-9_\-]

moarchar
  = [a-zA-Z0-9_\-.]

/* ===== Whitespace ===== */

_ "whitespace"
  = whitespace*

whitespace
  = [ \t\n\r]