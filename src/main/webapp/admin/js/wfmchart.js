/**
 * @class Workflow Node
 * @param {Object} container      Node container (Canvas), jQuery object
 * @param {String} id      Node ID
 * @param {String} name    Node name
 * @param {Number} x       Node x coordinate
 * @param {Number} y       Node y coordinate
 * @param {Object} [options] Additional node properties
 * @param {String} [options.color] Node text color
 * @param {String} [options.bgColor] Node background color
 * @param {Number} [options.radius] Node corner radius
 * @param {Number} [options.data] Additional data bound to the node
 * @param {Number} [options.container] Node container (Canvas). If set, the node auto-appends to canvas
 * @param {Boolean} [options.removable=true] Whether to support delete (hover to show close icon)
 */
var curWfmNode=null;
var curWfmRules=[];
var curChart=null;
let ChartNode = function(id, name, x, y, options) {
    this._jsPlumb = null;
    this._container = null;
    this._id = id;
    this._name = name;
    this._x = x;
    this._y = y;
    this._clsName = options.class || '';
    this._data = options && options.data || {};
    this._data.nodeId = id;
    this._options = $.extend({ // Default properties
        removable: true
    }, options);
    this._el = null;

    if (options && options.container) {
        this.appendTo(options.container);
    }
};

/**
 * Line style
 * @type {Object}
 */
ChartNode.lineStyle = {
    lineWidth: 1,
    joinstyle: "round",
    strokeStyle: "#0096f2"
};

/**
 * Label position
 */
ChartNode.labelPos = {
    'Bottom': [6, 2.5],
    'Top': [6, -2.5],
};

ChartNode.prototype.setPlumb = function (plumb) {
    this._jsPlumb = plumb;
};

ChartNode.prototype._px = (value) => {
    return value + 'px';
};

ChartNode.prototype.getId = function() {
    return this._id;
};

ChartNode.prototype.getData = function() {
    return this._data || {};
};

ChartNode.prototype.appendTo = function(container) {
    if (! container) {
        console.error('node container is null !');
        return;
    }

    let self = this;
    let options = self._options;
    let px = self._px;

    // Create and insert DOM node
    let node = $('<div>').addClass(`window task ${self._clsName}`)
        .attr('id', self._id)
        .css({
            left: px(self._x),
            top: px(self._y)
        })
        .text(self._name)
        .data('node', this._data)
        .data('__node', this);

    if (options.removable) {
        let removeIcon = $('<div>').addClass('remove');
        node.append(removeIcon);
    }

    container.append(node);
    this._jsPlumb.draggable(node, { grid: [10, 10] });

    this._el = node;
};

/**
 * Add connection port
 * @param {Object} options Connection port parameters
 * @param {String} [options.color=#0096f2] Port color
 * @param {Boolean} [options.isSource=false] Whether this is a source port
 * @param {Boolean} [options.isTarget=false] Whether this is a target port
 * @param {String} [options.label] Port name
 * @param {String} [options.position=bottom] Port position, can be set to 'Top'
 */
ChartNode.prototype.addPort = function(options) {
    let pos = options.position || 'Bottom';
    let labelPos = ChartNode.labelPos[pos];
    let endpointConf = {
        endpoint: "Dot",
        paintStyle: {
            strokeStyle: options.color || '#0096f2',
            radius: 2,
            lineWidth: 1
        },
        anchor: pos,
        isSource: !!options.isSource,
        isTarget: !!options.isTarget,
        maxConnections: -1,
        connector: ["Flowchart", { stub: [15, 15], gap: 0, cornerRadius: 5, alwaysRespectStubs: true }],
        connectorStyle: ChartNode.lineStyle,
        // connectorOverlays: [[ "Arrow", {location: 1}]],
        // hoverPaintStyle: endpointHoverStyle,
        // connectorHoverStyle: connectorHoverStyle,
        dragOptions: {},
        overlays: [
            ["Label", {
                location: labelPos,
                label: options.label || '',
                cssClass: "endpoint-label-lkiarest"
            }]
        ],
        allowLoopback:false
    };

    this._jsPlumb.addEndpoint(this._el, endpointConf);
};

/**
 * Update coordinates
 */
ChartNode.prototype.updatePos = function() {
    let el = this._el;
    this._x = parseInt(el.css("left"), 10);
    this._y = parseInt(el.css("top"), 10);
};

ChartNode.prototype.getPos = function() {
    return {
        x: this._x,
        y: this._y
    };
};

ChartNode.prototype.toPlainObj = function() {
    let item = this;
    item.updatePos();

    let data = $.extend({}, item._data);
    data.nodeId = item._id;
    data.positionX = item._x;
    data.positionY = item._y;
    data.className = item._clsName;
    data.removable = item._options.removable;

    return data;
};

ChartNode.prototype.dispose = function() {
    let el = this._el;
    let domEl = el.get(0);
    this._jsPlumb.detachAllConnections(domEl);
    this._jsPlumb.remove(domEl);
    el.remove();
};

/**
 * @class Canvas
 */
let Chart = function(container, options) {
    this._jsPlumb = null; // Multi-instance supported!
    this._container = container;
    this._nodes = [];
    this._seedName = 'flow-chart-node';
    this._seedId = 0;

    this.init(options);
};

Chart.prototype.nodeId = function() {
    return this._seedName + (this._seedId++) + (new Date).valueOf();
};

/**
 * Init method
 * @param  {Object} [options] Initialization parameters
 * @param {Function} [options.onNodeClick] Node click callback function, param is node-bound data
 */

Chart.prototype.init = function(options) {
    this._jsPlumb = jsPlumb.getInstance();
    this._jsPlumb.importDefaults({
        // DragOptions: { cursor: 'pointer', zIndex: 2000 },
        ConnectionOverlays: [
            ["PlainArrow", {
                width: 10,
                location: 1,
                id: "arrow",
                length: 8
            }]
        ],
        DragOptions : { cursor: 'pointer', zIndex:2000 },
        EndpointStyles : [{ fillStyle:'#225588' }, { fillStyle:'#558822' }],
        Endpoints : [ [ "Dot", { radius:2 } ], [ "Dot", { radius: 2 } ]],
        Connector:[ "Flowchart", { stub:[15, 25], gap:0, cornerRadius:5, alwaysRespectStubs:true } ],
        // ConnectionOverlays : [
        //     [ "Arrow", { 
        //         location:1,
        //         id:"arrow",
        //         length:20,
        //         foldback:0.4
        //     } ]
        // ]
    });

    this._container.addClass('flow-chart-canvas-lkiarest');

    // Click event
    if (options && options.onNodeClick) {
        this._container.on('click', '.task', event => {
            let target = $(event.target);
            options.onNodeClick.call(this, target.data('node'));
            let delNode = target.data('__node');
            curWfmNode=delNode.getData();

            document.getElementById("updNode").style.display="";
            document.getElementById("wfmnodeid").innerText = curWfmNode['nodeId'];
            document.getElementById("wfmname").value = curWfmNode['name'];

            window.setWfmItem("wfmcurnode",curWfmNode['nodeId'])

            if(curWfmNode['desc'])
                document.getElementById("wfmdesc").value = curWfmNode['desc'];
            else
                document.getElementById("wfmdesc").value = ""; 

            document.getElementById("btnStartDo").style.display="block";
            document.getElementById("btnEndDo").style.display="block";
            document.getElementById("btnRejectDo").style.display="block";

            if(curWfmNode['name']=="Start")
            {
                document.getElementById("btnRejectDo").style.display="none";
                document.getElementById("btnStartDo").style.display="none";
            }
            else
            {
                if(curWfmNode['name']=="End")
                {
                    document.getElementById("btnEndDo").style.display="none";
                    document.getElementById("btnRejectDo").style.display="none";
                }
            }
            
            
            if(curWfmNode['enddo'])
                document.getElementById("codeidWfmDoEndDo").value = curWfmNode['enddo'];
            else
                document.getElementById("codeidWfmDoEndDo").value = "";

            if(curWfmNode['startdo'])
                document.getElementById("codeidWfmDoStartDo").value = curWfmNode['startdo'];
            else
                document.getElementById("codeidWfmDoStartDo").value = "";

            if(curWfmNode['rejectdo'])
                document.getElementById("codeidWfmDoRejectDo").value = curWfmNode['rejectdo'];
            else
                document.getElementById("codeidWfmDoRejectDo").value = "";
            
            if(curWfmNode['selpsn'])
                document.getElementById("codeidWfmSelpsn").value = curWfmNode['selpsn'];
            else
                document.getElementById("codeidWfmSelpsn").value = "";

            document.getElementById("wfmroleindept").value = curWfmNode['roleindept'];
                
            document.getElementById("divSelItems").innerHTML="";
            if(curWfmNode['psn']&&curWfmNode['psn']!="")
            {
                document.getElementById("inpSel").style.display="none";
                selItemDo(curWfmNode['psn'],curWfmNode['psntitle']);
            }
            else
            {
                document.getElementById("inpSel").style.display="";
            }

            if(!curWfmNode['needall'])
            {
                curWfmNode['needall']="";
            }
            window.setWfmItem("needall",curWfmNode['needall']);
            if(!curWfmNode['needbefore'])
            {
                curWfmNode['needbefore']="";
            }
            window.setWfmItem("needbefore",curWfmNode['needbefore']);

            if(!curWfmNode['psnmode'])
            {
                curWfmNode['psnmode']="role";
            }
            if(!curWfmNode['formname'])
            {
                curWfmNode['formname']="";
            }

            if(curWfmNode['formsetname'])
            {
                document.getElementById("formSetName").value=curWfmNode['formsetname'];
            }
            else
            {
                document.getElementById("formSetName").value=""; 
            }
            if(curWfmNode['formsethidden'])
            {
                document.getElementById("formSetHidden").value=curWfmNode['formsethidden'];
            }
            else
            {
                document.getElementById("formSetHidden").value=""; 
            }
            if(curWfmNode['formsetreadonly'])
            {
                document.getElementById("formSetReadonly").value=curWfmNode['formsetreadonly'];
            }
            else
            {
                document.getElementById("formSetReadonly").value="";
            }

            window.setWfmItem("formname",curWfmNode['formname']);
            window.setWfmItem("psnmode",curWfmNode['psnmode']);
            window.setWfmItem("dutytree",curWfmNode['dutytree']);
            window.setWfmItem("dutyloop",curWfmNode['dutyloop']);
            window.setWfmItem("role",curWfmNode['role']);

            showNodeCons();
        });
    }
    // Delete node
    this._container.on('click', '.remove', event => {
        let delNode = $(event.target).parent().data('__node');
        if (delNode) {
            let data = delNode.getData();
            let nodeId = delNode.getId();
            delNode.dispose();

            this.removeNode(nodeId);
            document.getElementById("updNode").style.display="none";
            document.getElementById("wfmRules").innerHTML="";
            if (options && options.onNodeDel) {
                options.onNodeDel.call(this, data);
            }
        }

        event.stopPropagation();
    });
};

/**
 * Add new node
 * @param {String} name    Node name
 * @param {Number} x       Node x coordinate
 * @param {Number} y       Node y coordinate
 * @param {Object} options Node parameters, see {class ChartNode} constructor params
 * @param {String} [options.id] Node ID; auto-assigned if not defined
 */
Chart.prototype.addNode = function(name, x, y, options) {
    let id = options && options.id || this.nodeId();
    let node = new ChartNode(id, name, x, y, options);
    node.setPlumb(this._jsPlumb);
    node.appendTo(this._container);
    this._nodes.push(node);
    return node;
};

Chart.prototype.removeNode = function(nodeId) {
    let nodes = this._nodes;
    for (let i = 0, len = nodes.length; i < len; i++) {
        let node = nodes[i];
        if (node.getId() === nodeId) {
            node.dispose();
            nodes.splice(i, 1);
            return node;
        }
    }
};

Chart.prototype.getNodes = function() {
    return this._nodes;
};

/**
 * Serialize to save
 */
Chart.prototype.toJson = function() {
    // Get all nodes
    let nodes = [];
    this._nodes.forEach(item => {
        nodes.push(item.toPlainObj());
    });

    // Get all connections
    let connections = this._jsPlumb.getConnections().map(connection => {
        return {
            connectionId: connection.id,
            pageSourceId: connection.sourceId,
            pageTargetId: connection.targetId
        };
    });

    return {
        nodes: nodes,
        connections: connections
    };
};

/**
 * Deserialize saved data and draw the flowchart
 */
Chart.prototype.fromJson = function(jsonStr) {
    if (!jsonStr || jsonStr === '') {
        console.error('draw from json failed: empty json string');
        reutrn;
    }

    let jsonObj = null;

    try {
        jsonObj = JSON.parse(jsonStr);
    } catch (e) {
        console.error('invalid json string', e);
        return;
    }

    this.clear();

    let nodes = jsonObj.nodes;
    let connections = jsonObj.connections;

    nodes && nodes.forEach(item => {
        let node = this.addNode(item.name, item.positionX, item.positionY, {
            class: item.className,
            removable: item.removable,
            id: item.nodeId,
            data: item
        });

        switch(item.className) {
            case 'node-start': {
                node.addPort({
                    isSource: true
                });
                break;
            }
            case 'node-end': {
                node.addPort({
                    isTarget: true,
                    position: 'Top'
                });
                break;
            }
            default: {
                node.addPort({
                    isSource: true
                });

                node.addPort({
                    isTarget: true,
                    position: 'Top'
                });
            }
        }

        this._jsPlumb.repaint(node.getId());
    });

    connections && connections.forEach(item => {
        this._jsPlumb.connect({
            source: item.pageSourceId,
            target: item.pageTargetId,
            deleteEndpointsOnDetach:false,
            paintStyle: ChartNode.lineStyle,
            anchors: ["Bottom", [0.5, 0, 0, -1]]
        });
    });

    this._jsPlumb.repaintEverything();
};

/**
 * Clear canvas elements
 */
Chart.prototype.clear = function() {
    this._nodes && this._nodes.forEach(item => {
        item.dispose();
    });

    this._nodes = [];
    this._jsPlumb.detachAllConnections(this._container);
    this._jsPlumb.removeAllEndpoints(this._container);
};

/**
 * Destroy and release
 */
Chart.prototype.dispose = function () {
    this.clear();
    this._container.off('click'); // unbind events
    this._container = null;
};

Chart.ready = (callback) => {
    jsPlumb.ready(callback);
};

if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = Chart;
}

function getWfmNodeName(nodeId)
{
    let wfmJson = curChart.toJson();
    let wfmNodes = wfmJson['nodes'];
    for( let item of wfmNodes )
    {
        if(item['nodeId']==nodeId)
        {
            return item['name'];
        }
    }
    return "";
}
function removeCons(e,conSId,conTId)
{
    let p = e.target.parentElement.parentElement.parentElement;
    let pp = p.parentElement;

    let wfmObj = curChart.toJson();
    let wfmArr = wfmObj['connections'];
    for(let j=0;j<wfmObj['connections'].length;j++)
    {
        let item = wfmArr[j];
        if(item['pageSourceId']==conSId&&item['pageTargetId']==conTId)
        {
            wfmArr.splice(j,1);
            curChart.fromJson(JSON.stringify(wfmObj));
            pp.removeChild(p);
            return;
        }
    }
    
    return;
}
function showAddCons(e)
{
    document.getElementById("divAddCons").style.display="";
    let wfmObj = curChart.toJson();
    let wfmArr = wfmObj['nodes'];
    window.setWfmItem("wfmnodes",wfmArr);
}
function addConsDo(e)
{

    let eObj = document.getElementById("conEndNodeID");
    let eName = eObj.options[eObj.selectedIndex].text;
    let eID = eObj.options[eObj.selectedIndex].value;

    let sObj = document.getElementById("conSrcNodeID");
    let sName = sObj.options[sObj.selectedIndex].text;
    let sID = sObj.options[sObj.selectedIndex].value;

    if(sID==""||eID=="")
    {
        alert("Both source and target nodes cannot be empty!");
        return;
    }
    if(sName=="End")
    {
        alert("Source node cannot be 'End'"); 
        return;
    }
    if(eName=="Start")
    {
        alert("Target node cannot be 'Start'"); 
        return;
    }

    let wfmObj = curChart.toJson();
    let wfmArr = wfmObj['connections'];
    let bfind=false;
    for(let j=0;j<wfmObj['connections'].length;j++)
    {
        let item = wfmArr[j];
        if(item['pageSourceId']==sID&&item['pageTargetId']==eID)
        {
            bfind=true;
            break;
        }
    }

    if(!bfind)
    {
        let itemsub = {};
        itemsub['pageSourceId'] = sID;
        itemsub['pageTargetId'] = eID;
        itemsub['connectionId'] = "con_9999";
        wfmArr.push(itemsub);
        curChart.fromJson(JSON.stringify(wfmObj));
        document.getElementById("divAddCons").style.display="none";
        showNodeCons();
    }
}

function showNodeCons()
{
    let wfmJson = curChart.toJson();
    let wfmConnections = wfmJson['connections']

    document.getElementById("wfmRules").innerHTML="";
    document.getElementById("saveWfm-msg").style.display="none";
    document.getElementById("saveWfm-msg").innerHTML="";

    for( let item of wfmConnections )
    {
        if(curWfmNode['nodeId']==item['pageSourceId'])
        {
            let tname = getWfmNodeName(item['pageTargetId']);
            let dc = document.createElement("div");
            dc.className="wfmRulesDiv";
            dc.style.boxSizing="border-box";
            dc.style.padding="2px";
            dc.width="100%";

            let spn = document.createElement("span");
            spn.innerHTML="" + curWfmNode['name'] + "->" + tname + "<br>";
            dc.appendChild(spn);

            let sa = document.createElement("span");
            sa.className="action-content";
            sa.style.float="right";
            sa.innerHTML="<a href=\"javascript:void(0)\"><img width=\"18\"  src=\"./imgs/del.png\"></a>";
            sa.setAttribute("onclick","removeCons(event,'"+ item['pageSourceId'] +"','"+ item['pageTargetId'] +"');");
            dc.appendChild(sa);

            let inputsid = document.createElement("input");
            inputsid.className="wfmSourceId";
            inputsid.type="hidden";
            inputsid.value=item['pageSourceId'];
            dc.appendChild(inputsid);

            let inputtid = document.createElement("input");
            inputtid.className="wfmTargetId";
            inputtid.type="hidden";
            inputtid.value=item['pageTargetId'];
            dc.appendChild(inputtid);

            let inputtxt2 = document.createElement("input");
            inputtxt2.className="wfmConRulesCode";
            inputtxt2.value=getWfmRuleC(item['pageSourceId'],item['pageTargetId']);
            inputtxt2.id="codeidWfmRule" + item['pageSourceId'] + item['pageTargetId'];
            inputtxt2.type="hidden";
            dc.appendChild(inputtxt2);

            let inputbtn = document.createElement("input");
            inputbtn.className="btnDesign";
            inputbtn.style.marginTop="3px"
            inputbtn.value="Rule Code";
            inputbtn.setAttribute("onclick","openCodeValWin('WfmRule"+ item['pageSourceId'] + item['pageTargetId'] +"');");
            inputbtn.type="button";
            dc.appendChild(inputbtn);

            document.getElementById("wfmRules").appendChild(dc);
        }
    }
}

function closeAddCons(e)
{
    document.getElementById("divAddCons").style.display="none";
}

function getWfmRuleD(conSId,conTId)
{
    for( let item of curWfmRules )
    {
        if(item['conSId']==conSId&&item['conTId']==conTId)
        {
            return item['rule_design'];
        }
    }
    return "";
}

function getWfmRuleC(conSId,conTId)
{
    for( let item of curWfmRules )
    {
        if(item['conSId']==conSId&&item['conTId']==conTId)
        {
            return item['rule_code'];
        }
    }
    return "";
}

function openCodeValWin(codeId) 
{
    window.codeId = codeId;
    window.codeIdValue = document.getElementById("codeid" + codeId).value;

    document.getElementById("codeVal").style.display="block";
    let iframe = document.getElementById("codeValiframe");
    iframe.src="./code_design.html";
    if (iframe.attachEvent)
    {
        iframe.attachEvent("onload", openCodeWin1);
        } else {
        iframe.onload = openCodeWin2;
    }
    
}
function openCodeWin1()
{
      let iw = document.getElementById('codeValiframe').contentWindow;
      var varLists = [
        {"name":"wfmId","key":"wfmId","type":"str","ptype":"sys"},
        {"name":"wfmNodeId","key":"wfmNodeId","type":"str","ptype":"sys"},
        {"name":"wfmWorklistId","key":"wfmWorklistId","type":"str","ptype":"sys"},
        {"name":"wfmDataTable","key":"wfmDataTable","type":"str","ptype":"sys"},
        {"name":"wfmDataId","key":"wfmDataId","type":"str","ptype":"sys"},
        {"name":"operatorId","key":"operatorId","type":"str","ptype":"sys"},
        {"name":"operatorDeptId","key":"operatorDeptId","type":"str","ptype":"sys"},
        {"name":"operatorOrgId","key":"operatorOrgId","type":"str","ptype":"sys"},
        {"name":"operatorRoles","key":"operatorRoles","type":"str","ptype":"sys"}
    ];

      iw.initTemplate(window.codeId,"",[],[],varLists,window.codeIdValue);
      document.getElementById("compiframe").detachEvent("onload", openCodeWin1);
}
function openCodeWin2()
{
      let iw = document.getElementById('codeValiframe').contentWindow;
      var varLists = [
        {"name":"wfmId","key":"wfmId","type":"str","ptype":"sys"},
        {"name":"wfmNodeId","key":"wfmNodeId","type":"str","ptype":"sys"},
        {"name":"wfmWorklistId","key":"wfmWorklistId","type":"str","ptype":"sys"},
        {"name":"wfmDataTable","key":"wfmDataTable","type":"str","ptype":"sys"},
        {"name":"wfmDataId","key":"wfmDataId","type":"str","ptype":"sys"},
        {"name":"operatorId","key":"operatorId","type":"str","ptype":"sys"},
        {"name":"operatorDeptId","key":"operatorDeptId","type":"str","ptype":"sys"},
        {"name":"operatorOrgId","key":"operatorOrgId","type":"str","ptype":"sys"},
        {"name":"operatorRoles","key":"operatorRoles","type":"str","ptype":"sys"}
    ];

      iw.initTemplate(window.codeId,"",[],[],varLists,window.codeIdValue);
      document.getElementById("codeValiframe").onload=null;
}

function setCodeValValue(fValue) 
{
    document.getElementById("codeid" + window.codeId).value = fValue["codeid"];
    if(window.codeId!="WfmDoInit"&&window.codeId!="WfmDoReturn")
    {
        saveNodeDo();
    }

}

function closeCodeValWin() 
{
    document.getElementById("codeVal").style.display="none";
}