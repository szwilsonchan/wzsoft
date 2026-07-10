String.prototype.replaceAll=function(str,replace,ingore){
    ingore = ingore || false;
    var reg;
    if(!ingore){
        reg = new RegExp(str,"g");
    }else{
        reg = new RegExp(str,"gi");
    }
    return this.replace(reg,replace);
}

function selItemHide()
{
    let dnode = document.getElementById("divSelSearchs");
    dnode.style.display="none";
}
function selItemDel(e)
{
    let p = e.srcElement.parentElement.parentElement.parentElement;
    if(p.parentElement.className=="divSelItems")
    {
        p.parentElement.removeChild(p);
        document.getElementById("inpSel").style.display="block";
    }

}
function selItemDo(id,title)
{
    let d = document.createElement("div");
    d.className="selItemDiv";

    let s="";
    s = s + "<span class=\"action-content\" style=\"border:none\"></span>";
    s = s + "<input type='hidden' />";
    s = s + "<span class=\"action-content\" style=\"float:right\" ><a href='#' onclick=\"selItemDel(event);return false\"><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    d.innerHTML=s;

    d.childNodes[0].innerHTML=title;
    d.childNodes[1].value=id;
    document.getElementById("divSelItems").appendChild(d);
    document.getElementById("divSelItems").style.display="block";
    document.getElementById("divSelSearchs").style.display="none";
    document.getElementById("inpSel").style.display="none";

}
function selItemSearch(e)
{
    let inp = e.target.value;
    //alert(inp);
    if(inp.length>=2)
    {
        let paras = {};
        paras['viewCode']="psn";
        paras['curPage']=1;
        paras['pageItmes']=100;
        paras['topItems']=3;
        paras['filter_searchkey_like']=inp;

        axios.post("./../api/datalist",paras).then(function(res){
        psndatas=Object.values(res.data)[0];

        let strpsn="";
        for (let item of psndatas) 
        {
            let itemID = "";
            let itemTitle = "";

            itemID = item["PSNID"]+"";
            itemTitle = item["NAME"] + "(" + item["EMAIL"] + ")";

            itemID=itemID.replaceAll("'","\\'");
            itemTitle=itemTitle.replaceAll("'","\\'");

            strpsn = strpsn + "<div class=\"selItemShow\" onclick=\"selItemDo('"+ itemID +"','"+ itemTitle +"')\" ><span style=\"border:none\"><b>"+ itemTitle +"</b></span>";
            strpsn = strpsn + "<div style=\"border:none\">"+ item["EMAIL"] +"</div></div>";
        }
        let dnode = document.getElementById("divSelSearchs");
        dnode.innerHTML=strpsn;
        dnode.style.display="block";

        }).catch(function (err) {
        });
    }
    else
        selItemHide();
}
function getDataItem() 
{
    let paras = {};
    paras['viewCode']="wfm";
    paras['itemIDs']=getdataID();
    axios.post("./../api/wfmget",paras).then(function(res){
    let dataTmp=Object.values(Object.values(res.data)[0])[0];
    curWfmData=dataTmp['WFMDATA'];
    if(dataTmp['WFMRULE']!=null)
    {
        let wfmRules = JSON.parse(dataTmp['WFMRULE']);
        curWfmRules=wfmRules['rules'];
    }
    if(dataTmp['WFMDATA']!=null)
    {
        curChart.fromJson(curWfmData);
        let wfmDatas = JSON.parse(dataTmp['WFMDATA']);
        if(wfmDatas['returndo'])
        {
            document.getElementById("codeidWfmDoReturn").value=wfmDatas['returndo'];
        }
        if(wfmDatas['initdo'])
        {
            document.getElementById("codeidWfmDoInit").value=wfmDatas['initdo'];
        }
    }
    }).catch(function (err) {
    });
}

function getWfmRefData(itemIDs) 
{
    let paras = {};
    paras['viewCode']="data_fields";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    paras['filter_dataid_equal']=itemIDs;
    axios.post("./../api/datalist",paras).then(function(res){
    curWfmRefDataFields=Object.values(res.data)[0];
    let attrs = [];
    for (let k of curWfmRefDataFields) 
    {
        let sK = k['FIELD'];
        let sAttr = k['FIELD_TITLE'];
        let ot = {};
        ot[sK]=sAttr;
        attrs.push(ot);
    }

    comAttrsSet['data'+itemIDs]=attrs;
    comAttrsGet['data'+itemIDs]=attrs;

    }).catch(function (err) {
    });
}

function saveNodeDo()
{
    curWfmNode['name'] = document.getElementById("wfmname").value;
    curWfmNode['desc'] = document.getElementById("wfmdesc").value;

    curWfmNode['psn'] = "";
    curWfmNode['psntitle'] = "";

    let dpsn = document.getElementById("divSelItems");
    for (let dNode of dpsn.childNodes) 
    {
        if(dNode.className == "selItemDiv")
        {
            curWfmNode['psn'] = dNode.childNodes[1].value;
            curWfmNode['psntitle'] = dNode.childNodes[0].innerHTML;
        }
    }

    curWfmNode['psnmode'] = document.getElementById("wfmpsnmode").value;
    curWfmNode['dutytree'] = document.getElementById("wfmdutytree").value;
    curWfmNode['formname'] = document.getElementById("wfmformname").value;
    curWfmNode['dutyloop'] = document.getElementById("wfmdutyloop").value;
    curWfmNode['needall'] = document.getElementById("wfmneedall").value;
    curWfmNode['needbefore'] = document.getElementById("wfmneedbefore").value;

    curWfmNode['role'] = document.getElementById("wfmrole").value;
    curWfmNode['enddo'] = document.getElementById("codeidWfmDoEndDo").value;
    curWfmNode['startdo'] = document.getElementById("codeidWfmDoStartDo").value;
    curWfmNode['rejectdo'] = document.getElementById("codeidWfmDoRejectDo").value;
    curWfmNode['selpsn'] = document.getElementById("codeidWfmSelpsn").value;
    curWfmNode['roleindept'] = document.getElementById("wfmroleindept").value;

    curWfmNode['formsetname']=document.getElementById("formSetName").value;
    curWfmNode['formsethidden']=document.getElementById("formSetHidden").value;
    curWfmNode['formsetreadonly']=document.getElementById("formSetReadonly").value;

    curWfmNode['formsetname']=document.getElementById("formSetName").value=curWfmNode['formsetname'];
    curWfmNode['formsethidden']=document.getElementById("formSetHidden").value=curWfmNode['formsethidden'];
    curWfmNode['formsetreadonly']=document.getElementById("formSetReadonly").value=curWfmNode['formsetreadonly'];

    if(curWfmNode['formname']!=curWfmNode['formsetname'])
    {
        curWfmNode['formsethidden']="";
        curWfmNode['formsetreadonly']="";
        curWfmNode['formsetname']="";
    }
    
    curChart.fromJson(JSON.stringify(curChart.toJson()));

    let dc = document.getElementById("wfmRules");
    for (let dcRole of dc.childNodes) 
    {
        let wfmRole = {};
        for (let dNode of dcRole.childNodes) 
        {
            if(dNode.className == "wfmSourceId")
            {
                wfmRole['conSId'] = dNode.value;
            }
            if(dNode.className == "wfmTargetId")
            {
                wfmRole['conTId'] = dNode.value;
            }
            if(dNode.className == "wfmConRulesCode")
            {
                wfmRole['rule_code'] = dNode.value;
            }
        }
        let blnFind=false;
        for( let item of curWfmRules )
        {
            if(item['conSId']==wfmRole['conSId']&&item['conTId']==wfmRole['conTId'])
            {
                item['rule_code'] = wfmRole['rule_code'];
                blnFind = true;
                break;
            }
        }
        if(!blnFind)
        {
            curWfmRules.push(wfmRole);
        }
    }

    let msg="";
    if(!gCheckValueNull(curWfmNode['name']))
    {
        msg = msg+"Name cannot be empty<br>";
    }
    else
    {
        if(!gCheckValueLen(curWfmNode['name'],50))
        {
            msg = msg+"Name length cannot exceed 50 characters.<br/>";
        }
    }
    if(!gCheckValueLen(curWfmNode['desc'],200))
    {
        msg = msg+"Description cannot exceed 200 characters.<br/>";
    }

    if(msg!="")
    {
        document.getElementById("saveWfm-msg").innerHTML=msg;
        document.getElementById("saveWfm-msg").style.display="block";
        setTimeout(closeSaveWfmMsg,1000);
        return;
    }

    document.getElementById("saveWfm-msg").style.display="";
    document.getElementById("saveWfm-msg").innerHTML="Saved";
    setTimeout(closeSaveWfmMsg,1000);

    saveWfm();
}

Chart.ready(() => {
    const basicX = 150;
    const startY = 20;
    const endY = 350;
    const newX = 50;
    const newY = 50;

    let _current = null; // Currently selected node ID

    let _showNodeInfo = (data) => {
        if (!data) {
            return;
        }

        let infoPanel = $('.right');
        infoPanel.find('.proc-name').text(data.name || '');
        infoPanel.find('.proc-desc').text(data.desc || '');
    };

    let _hideNodeInfo = () => {
        _showNodeInfo({
            name: '',
            desc: ''
        });
    };

    let _createChart = function() {
        return new Chart($('#demo-chart'), {
            onNodeClick (data) { // Triggered when node is clicked
                _showNodeInfo(data);
                _current = data.nodeId;
            },
            onNodeDel (data) {
                console.log(data);
                _hideNodeInfo();
            }
        })
    };

    let chart = _createChart();

    // Add start node
    let nodeStart = chart.addNode('Start', basicX, startY, {
        class: 'node-start',
        removable: false,
        data: {
            name: 'Start',
            nodeType: 0
        }
    });
    nodeStart.addPort({
        isSource: true
    });

    // Add end node
    let nodeEnd = chart.addNode('End', basicX, endY, {
        class: 'node-end',
        removable: false,
        data: {
            name: 'End',
            nodeType: 0
        }
    });
    nodeEnd.addPort({
        isTarget: true,
        position: 'Top'
    });

    const addNewTask = (name, params) => {
        params = params || {};
        params.data = params.data || {};
        params.class = 'node-process';
        params.data.nodeType = 1; // Workflow NodeType
        let node = chart.addNode(name, newX, newY, params);
        node.addPort({
            isSource: true
        });
        node.addPort({
            isTarget: true,
            position: 'Top'
        });
    };

    const bindEvent = () => {
         $(".flowchart-panel").on('click', '.btn-add', function(event) {
            let target = $(event.target);
            let node = target.data('node');
            node={"name":"Workflow Node","procId":"0","desc":""};
            addNewTask(node.name, {
                data: node
            });
        });

        $(".btn-save").click(() => {
            $('#jsonOutput').val(JSON.stringify(chart.toJson()));
        });

        $(".btn-load").click(() => {
            if ($('#demo-chart').length === 0) {
                $('<div id="demo-chart"></div>').appendTo($('.middle'));
                chart = _createChart();
            }
            chart.fromJson($('#jsonOutput').val());
        });

        $(".btn-clear").click(() => {
            $('#demo-chart').remove();
            chart.clear();
        });

        $(".btnSaveWfm").click(() => {

            saveNodeDo();

        });

    };

    bindEvent();

    // Use test data
    let listHtml = '';
    TEST_NODES.forEach(node => {
        listHtml += `<li>&nbsp;<a class='btn-add' data-id='node.procId' href='javascript:void(0)'>Add Node</a></li>`;
    });
    $('.nodes').html(listHtml);
    $('.nodes').find('.btn-add').each(function(index) {
        $(this).data('node', $.extend({}, TEST_NODES[index]));
    });
     
    curChart=chart;
    getDataItem();

});

function closeSaveMsg() 
{
    document.getElementById("main-wrapper-info").style.display="none";
}

function closeSaveWfmMsg() 
{
    document.getElementById("saveWfm-msg").style.display="none";
}

function getdataID()
{
    let a = location.href;
    let b = a.split("?wfmid=");
    return b[1];
}

function saveWfm()
{
    let dataID= getdataID();

    let paras = {};
    paras['viewCode']="wfm";
    paras['itemIDs']=dataID;
    paras['field_WFMDATA']=JSON.stringify(curChart.toJson());

    let wfmObj = curChart.toJson();

    let returnDo = document.getElementById("codeidWfmDoReturn").value;
    let initDo = document.getElementById("codeidWfmDoInit").value;
    
    wfmObj['returndo'] = returnDo;
    wfmObj['initdo'] = initDo;
    paras['field_WFMDATA']=JSON.stringify(wfmObj);

    let wfmArr = wfmObj['connections'];

    for(let i=0;i<curWfmRules.length;i++)
    {
        let item = curWfmRules[i];
        let bfind = false;
        for(let j=0;j<wfmObj['connections'].length;j++)
        {
            let itemsub = wfmArr[j];
            if(itemsub['pageSourceId']==item['conSId']&&itemsub['pageTargetId']==item['conTId'])
            {
                bfind=true;
                break;
            }
        }
        if(!bfind)
        {
            curWfmRules.splice(i,1);
        }
    }

    let wfmrules = {};
    wfmrules['rules']=curWfmRules;

    paras['field_WFMRULE']=JSON.stringify(wfmrules);

    axios.post("./../api/wfmsave",paras).then(function(res)
    {
        returnmsg=Object.values(Object.values(res.data)[0])[0];
        if(returnmsg!="")
        {
            document.getElementById("main-wrapper-info-msg").innerHTML=that.returnmsg;
            document.getElementById("main-wrapper-info").style.display="block";
        }
        else
        {
            document.getElementById("main-wrapper-info-msg").innerHTML="Saved!";
            document.getElementById("main-wrapper-info").style.display="block";
            setTimeout(closeSaveMsg,2000);
        }
    }).catch(function (err) {
    });
}
