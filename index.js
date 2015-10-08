#!/usr/bin/env node

var fs       = require('fs')
  , graphviz = require('graphviz')
  ;

var file = process.argv[2];

var fileContents = fs.readFileSync(file);

var wf = JSON.parse(fileContents);

var g = graphviz.digraph("G");

var signals   = (wf.data      || wf.signals);
var processes = (wf.processes || wf.tasks  );

var sigMap    = {};
signals.forEach(function(sig, ix) {
  sigMap[sig.name] = ix;
});

var sigToId = function(sig) {
  if(!isNaN(parseInt(sig))) {
    return sig;
  } else {
    return sigMap[sig];
  }
};

(wf.tasks || wf.processes).forEach(function(e, ix) {
  var id = "t_" + ix;
  var n = g.addNode(id);
  n.set('label', e.name);
  e.ins.forEach(function(e){
    var n = e.toString().split(":")[0];
    g.addEdge("d_" + sigToId(n), id);
  })
  e.outs.forEach(function(e){
    var n = e.toString().split(":")[0];
    g.addEdge(id, "d_" + sigToId(n));
  })
});

var sigNodes = {};

(wf.data || wf.signals).forEach(function(e, ix) {
  var n = g.addNode("d_" + ix);
  n.set('label', e.name);
  n.set('shape', "folder");
  sigNodes[ix] = n;
});

wf.ins.forEach(function(e){
  sigNodes[sigToId(e)].set('color', 'green');
});

wf.outs.forEach(function(e){
  sigNodes[sigToId(e)].set('color', 'red');
});

fs.writeFileSync(file + ".dot", g.to_dot());
