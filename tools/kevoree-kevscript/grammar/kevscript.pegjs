/*
 * Kevoree KevScript grammar 
 */

{
//  var kevoree = require('kevoree-library').org.kevoree;
//  var factory = new kevoree.impl.DefaultKevoreeFactory();
  var model = {
    nodes: {},
    groups: {},
    chans: {}
  };
}

// grammar entry-point
start
  = instructions _?
  { return model; }


instructions
  = instruction+


instruction
  = (addNode / addComp / addGroup / addChan / addNodeToGroup / removeNodeFromGroup) _


addNode
  =  AddNodeToken _ type:EntityType _ name:EntityName
  { return model.nodes[name] = {type: type, components: {}}; }


addComp
  =  AddCompToken _ '@' _ nodeName:EntityName _ type:EntityType _ name:EntityName
  { return model.nodes[nodeName].components[name] = {type: type}; }


addGroup
  =  AddGroupToken _ type:EntityType _ name:EntityName
  { return model.groups[name] = {type: type, subnodes: []}; }


addChan
  =  AddChanToken _ type:EntityType _ name:EntityName
  { return model.chans[name] = {type: type}; }


addNodeToGroup
  = AddToken _ nodeName:EntityName _ groupName:EntityName
  { return model.groups[groupName].subnodes.push(nodeName); }
  / AddToken _ nodeList:NodeList _ groupName:EntityName
  { 
    for (var i in nodeList) {
      model.groups[groupName].subnodes.push(nodeList[i]);
    }
    return model.groups;
  }


removeNodeFromGroup
  = RemoveToken _ nodeName:EntityName _ groupName:EntityName
  {
    var subnodes = model.groups[groupName].subnodes;
    return subnodes.splice(subnodes.indexOf(nodeName), 1);
  }
  / RemoveToken _ nodeList:NodeList _ groupName:EntityName
  { 
    var subnodes = model.groups[groupName].subnodes;
    for (var i in nodeList) {
      subnodes.splice(subnodes.indexOf(nodeList[i]), 1);
    }
    return model.groups;
  }
  

NodeList
  = '[' _ first:EntityName others:([,]? _ EntityName)*  _ ']'
  {
    var nodeList = [];
    nodeList.push(first);
    for (var i=0; i < others.length; i++) {
      nodeList.push(others[i][2]);
    }
    return nodeList;
  }

/* ===== Lexical Elements ===== */
EntityType
  = chars:char+
  { return chars.join(''); }

EntityName
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

char
  = [a-zA-Z0-9_-]

/* ===== Whitespace ===== */

_ "whitespace"
  = whitespace*

whitespace
  = [ \t\n\r]