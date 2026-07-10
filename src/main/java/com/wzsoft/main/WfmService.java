package com.wzsoft.main;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.openjdk.nashorn.api.scripting.ScriptObjectMirror;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.util.ResourceUtils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

@Service()
public class WfmService {
    
    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private DatalistService dService;

    @Autowired
    private RedisCache redisCache;

    @Transactional
    public int delDatas(String viewCode,String itemIDs,Object args[])  throws Throwable 
    {
        delWfmData(itemIDs);
        JSONObject jPara = new JSONObject();
        return dService.delDatas(viewCode, itemIDs, jPara);
    }

    @Transactional
    public String delWfmData(String wfmID)  throws Throwable 
    {
        String msg="";
        String sql = "delete from wfm_run_node where wfmid =? " ;
        datalistDao.delDatas(sql, new Object[]{wfmID});

        sql = "delete from wfm_run_worklist where wfmid =? " ;
        datalistDao.delDatas(sql, new Object[]{wfmID});

        sql = "delete from wfm_entrust where wfmid =? " ;
        datalistDao.delDatas(sql, new Object[]{wfmID});

        return msg;

    }

    
    @Transactional
    public HashMap<String,String> approveDatas(String itemIDs,String flag,JSONObject jsonObject)   throws Throwable
    {
        String msg="";
        String tablename="";
        String appname="";
        String strPkey="";
        Integer wfmworkid = Integer.valueOf(itemIDs);
        Integer wfmId=0;
        String wfmData="";
        String wfmRule="";
        Integer dataitemid = 0;
        String dataitemname = "";
        String approveComment = jsonObject.getString("field_APPROVECOMMENT");
        Integer opPsnId=Integer.valueOf(jsonObject.getString("psnid"));
        Integer sysDeptId=Integer.valueOf(jsonObject.getString("deptid"));
        Integer sysOrgId=Integer.valueOf(jsonObject.getString("orgid"));
        String updData="";
        String msgMode="";
        String formname="";
        String rejectedNode = "";

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        if(jsonObject.containsKey("rejectedNode")&&jsonObject.get("rejectedNode")!=null)
        {
            rejectedNode = jsonObject.get("rejectedNode").toString();
        }

        if(approveComment==null)
        {
            approveComment = "";
        }

        List lwsm =  datalistDao.getDatas("select wrk.*,w.wfmdata,w.wfmrule,w.upddata,w.msgmode from wfm_run_worklist wrk,wfm w where wrk.completed='0' and w.wfmid=wrk.wfmid and wrk.wfmworkid= ? and wrk.psnid=?" , new Object[] {wfmworkid,opPsnId});
        if(lwsm.size()>0)
        {
            Map<String,Object> mwsm=(Map)lwsm.get(0);
            wfmId = Integer.parseInt(mwsm.get("wfmId").toString());
            dataitemid = Integer.parseInt(mwsm.get("dataitemid").toString());
            dataitemname = (String)mwsm.get("dataitemname");
            String startNodeId = (String)mwsm.get("wfmnodeid");
            Boolean startNeedAll=false;
            String targetNodeId="";
            updData = (String)mwsm.get("upddata");
            msgMode = (String)mwsm.get("msgmode");
            tablename = (String)mwsm.get("tblname");
            formname = (String)mwsm.get("formname");
            strPkey = "id";

            String chkUpdSql="select name from data where tablename=?";
            Map<String,Object> mapp = datalistDao.getDataSingle(chkUpdSql,new Object[]{tablename});
            appname = mapp.get("name").toString();

            if(mwsm.get("wfmData")!=null)
            {
                wfmData = (String)mwsm.get("wfmData");
                wfmRule = (String)mwsm.get("wfmRule");
                
                wfmData = WSoftUtil.readWfmFile(wfmData);
                wfmRule = WSoftUtil.readWfmFile(wfmRule);
            }
            else
            {
                msg = WSoftMsg.getMsgItem("wfm_noconfig",lan);
            }

            if(msg.equals(""))
            {
                JSONObject jrulePara = (JSONObject)JSON.parse(wfmRule);
                boolean blnFind=false;

                JSONObject jsonwsmData = (JSONObject)JSON.parse(wfmData);
                Map<String,String> curNode =getTargetNode(startNodeId,jsonwsmData);
                String strStartDoCodeIdFirst="";
                String strEndDoCodeId="";
                Boolean blnEndDoCode =false;
                String strRejectDoCodeId="";

                String returnDoCodeId="";
                returnDoCodeId = jsonwsmData.get("returndo").toString();

                if(curNode.containsKey("enddo"))
                    strEndDoCodeId =(String)curNode.get("enddo");
                if(curNode.containsKey("rejectdo"))
                    strRejectDoCodeId =(String)curNode.get("rejectdo");
                if(curNode.containsKey("startdo"))
                    strStartDoCodeIdFirst =(String)curNode.get("startdo");

                datalistDao.updDatas("update wfm_run_worklist set isnew='0' where isnew='1' and wfmid=? and dataitemid=? and tblname=? and wfmnodeid=? and completed='0' and isold='0' " , new Object[] {wfmId,dataitemid,tablename,startNodeId}); 
                datalistDao.updDatas("update wfm_run_node set isnew='0' where isnew='1' and wfmid=? and dataitemid=? and tblname=? and wfmnodeid=? and completed='0' and isold='0' ", new Object[] {wfmId,dataitemid,tablename,startNodeId});

                if(flag.equalsIgnoreCase("1"))
                {
                    if(curNode.containsKey("needall")&&!curNode.get("needall").toString().equals(""))
                    {
                        List lpsn =  datalistDao.getDatas("select psnid from wfm_run_worklist where isold='0' and completed='0' and dataitemid=? and tblname=? and wfmnodeid=? " , new Object[] {dataitemid,tablename,startNodeId});
                        if(lpsn.size()>=2)
                        {
                            startNeedAll=true;
                            blnFind=true;
                        }
                    }

                    if(!blnFind&&curNode.containsKey("psnmode")&&curNode.get("psnmode").equals("dutytree"))
                    {
                        if(!curNode.get("dutytree").equals("")&&curNode.get("dutyloop").equals("1"))
                        {
                            if(setNodepsn(curNode, wfmId, dataitemid, startNodeId, dataitemname, opPsnId, sysDeptId,sysOrgId,tablename,msgMode,lan,appname))
                            {
                                blnFind=true;
                                if(!blnEndDoCode)
                                {
                                    msg = codeWsmDo(strEndDoCodeId,0,startNodeId, wfmId, dataitemid, opPsnId, sysDeptId,tablename,approveComment);
                                    if(!msg.equals(""))
                                        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                    else
                                        blnEndDoCode=true;
                                }
                                
                                if(msg.equals(""))
                                {
                                    msg = codeWsmDo(strStartDoCodeIdFirst,0,targetNodeId,wfmId, dataitemid, opPsnId, sysDeptId,tablename,approveComment);
                                    if(!msg.equals(""))
                                        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                }
                            }
                        }
                    }
                    
                    if(!blnFind&&msg.equals(""))
                    {
                        String strStartDoCodeId="";
                        List<Object> lcons=(List<Object>)jsonwsmData.get("connections");
                        for(int j=0;j<lcons.size();j++)
                        {
                            Map<String,String> mcons=(Map)lcons.get(j); 
                            String pageSourceId = mcons.get("pageSourceId").toString();
                            String pageTargetId = mcons.get("pageTargetId").toString();
                            if(pageSourceId.equalsIgnoreCase(startNodeId))
                            {
                                Map<String,String> mnodetarget =getTargetNode(pageTargetId,jsonwsmData);
                                String nodeName = mnodetarget.get("name").toString();
                                if(mnodetarget.containsKey("startdo"))
                                    strStartDoCodeId =mnodetarget.get("startdo").toString();

                                if(!nodeName.equalsIgnoreCase("End")&&msg.equals(""))
                                {
                                    if(checkNodeRule(jrulePara,wfmId,dataitemid,pageSourceId,pageTargetId,opPsnId,sysDeptId, tablename))
                                    {
                                        if(chkNodeNeedBefore(jrulePara, jsonwsmData, wfmId, pageSourceId, pageTargetId, dataitemid, tablename))
                                        {
                                            blnFind=true;
                                        }
                                        else
                                        {
                                            if(setNodepsn(mnodetarget,wfmId, dataitemid, pageTargetId, dataitemname,opPsnId,sysDeptId,sysOrgId,tablename,msgMode,lan,appname))
                                            {
                                                targetNodeId = pageTargetId;
                                                blnFind=true;
                                                if(!blnEndDoCode)
                                                {
                                                    msg = codeWsmDo(strEndDoCodeId,0,startNodeId, wfmId, dataitemid, opPsnId, sysDeptId,tablename,approveComment);
                                                    if(!msg.equals(""))
                                                        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                                    else
                                                        blnEndDoCode=true;
                                                }
                                                
                                                if(msg.equals(""))
                                                {
                                                    msg = codeWsmDo(strStartDoCodeId,0,targetNodeId,wfmId, dataitemid, opPsnId, sysDeptId,tablename,approveComment);
                                                    if(!msg.equals(""))
                                                        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                                }
                                            }  
                                        }
                                    }
                                }
                                else if(msg.equals(""))
                                {
                                    if(checkNodeRule(jrulePara,wfmId,dataitemid,pageSourceId,pageTargetId,opPsnId,sysDeptId, tablename))
                                    {
                                        if(!chkNodeNeedBefore(jrulePara, jsonwsmData, wfmId, pageSourceId, pageTargetId, dataitemid, tablename))
                                        {
                                            if(updData.equals("1"))
                                            {
                                                datalistDao.updDatas("update " + tablename + " set sysstatus='2' where  " + strPkey +"= ? " , new Object[] {dataitemid});

                                                datalistDao.updDatas("update wfm_run_node set completed='1',isold='1' where wfmid=? and dataitemid=? and tblname=? and isold='0' " , new Object[] {wfmId,dataitemid,tablename}); 
                                                datalistDao.updDatas("update wfm_run_worklist set completed='1',isold='1' where wfmid=? and dataitemid=? and tblname=? and isold='0' " , new Object[] {wfmId,dataitemid,tablename}); 
                                                // On End, mark all review records as expired and completed

                                                WSoftUtil.dbUpdDataUpdTime(datalistDao, tablename);
                                            }
                                        }
                                        
                                        sendEmailCompleted(String.valueOf(dataitemid),dataitemname,tablename, approveComment, msgMode,lan);

                                        blnFind=true;
                                        if(!blnEndDoCode)
                                        {
                                            msg = codeWsmDo(strEndDoCodeId,0,startNodeId, wfmId, dataitemid, opPsnId, sysDeptId,tablename,approveComment);
                                            if(!msg.equals(""))
                                                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                            else
                                                blnEndDoCode=true;
                                        }
                                        
                                        if(msg.equals(""))
                                        {
                                            msg = codeWsmDo(strStartDoCodeId,0,targetNodeId,wfmId, dataitemid, opPsnId, sysDeptId,tablename,approveComment);
                                            if(!msg.equals(""))
                                                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                        }
                                        
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    
                    if(!rejectedNode.equals(""))
                    {
                        String strArrRe[] = rejectedNode.split("\\|");
                        rejectedNode = strArrRe[0];
                        String rejectPsn = strArrRe[1];
                        Map<String,String> rejecetMp = getTargetNode(rejectedNode, jsonwsmData);
                        String rejectStartDoCode = "";
                        if(rejecetMp.containsKey("startdo"))
                            rejectStartDoCode =rejecetMp.get("startdo").toString();

                        String resql = "select psnid,formname from wfm_run_worklist where isold='0' and completed='1' and dataitemid=? and tblname=? and wfmnodeid=? and psnid=?";
                        List lpsn =  datalistDao.getDatas(resql, new Object[]{dataitemid,tablename,rejectedNode,rejectPsn});
                    
                        List<Object> lcons=(List<Object>)jsonwsmData.get("connections");
                        Map<String,String> afterMp = new HashMap<>();
                        findAfterNodes(rejectedNode, afterMp, lcons);
                        Set<String> keyMp = afterMp.keySet();
                        for (String key : keyMp) 
                        {
                            datalistDao.updDatas("update wfm_run_node set isold='1',completed='1' where wfmid=? and dataitemid=? and tblname=? and isold='0' and wfmnodeid=?" , new Object[] {wfmId,dataitemid,tablename,key}); 
                            datalistDao.updDatas("update wfm_run_worklist set isold='1',completed='1' where wfmid=? and dataitemid=? and tblname=? and isold='0' and wfmnodeid=?" , new Object[] {wfmId,dataitemid,tablename,key}); 
                            // On Reject, mark subsequent nodes as expired and completed
                        }
                        
                        datalistDao.addDatas("insert into wfm_run_node(wfmid,dataitemid,wfmnodeid,tblname) values(?,?,?,?)", new Object[] {wfmId,dataitemid,rejectedNode,tablename});
                        for(int i=0;i<lpsn.size();i++)
                        {
                            Map<String,Object> rmp = (Map<String,Object>)lpsn.get(i);
                            String rpsnid=String.valueOf(rmp.get("psnid"));
                            String rformname = String.valueOf(rmp.get("formname"));
                            
                            String wrlid="0";
                            wrlid=WSoftUtil.dbSqlAutoIDGet(datalistDao,"wfm_run_worklist","wfmworkid");
                            datalistDao.addDatas("insert into wfm_run_worklist(wfmworkid,wfmid,dataitemid,wfmnodeid,dataitemname,psnid,tblname,formname) values(?,?,?,?,?,?,?,?)", new Object[] {wrlid,wfmId,dataitemid,rejectedNode,dataitemname,rpsnid,tablename,rformname});

                        }
                        msg = codeWsmDo(rejectStartDoCode, wfmworkid,startNodeId,wfmId, dataitemid, opPsnId, sysDeptId, tablename,approveComment);
                        if(!msg.equals(""))
                            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                    }
                    else
                    {
                        datalistDao.updDatas("update wfm_run_node set isold='1',completed='1' where wfmid=? and dataitemid=? and tblname=? and isold='0' " , new Object[] {wfmId,dataitemid,tablename}); 
                        datalistDao.updDatas("update wfm_run_worklist set isold='1',completed='1' where wfmid=? and dataitemid=? and tblname=? and isold='0' " , new Object[] {wfmId,dataitemid,tablename}); 
                        // On Reject, mark all review records as expired and completed
                        
                        if(updData.equals("1"))
                        {
                            datalistDao.updDatas("update " + tablename + " set sysstatus='0' where  " + strPkey +"= ? " , new Object[] {dataitemid});
                            WSoftUtil.dbUpdDataUpdTime(datalistDao, tablename); 
                        }

                        sendEmailReject(String.valueOf(dataitemid),dataitemname,tablename, approveComment, msgMode,lan);

                    }

                    blnFind=true;
                    if(msg.equals(""))
                    {
                        msg = codeWsmDo(strRejectDoCodeId, wfmworkid,startNodeId,wfmId, dataitemid, opPsnId, sysDeptId, tablename,approveComment);
                        if(!msg.equals(""))
                            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                        
                        if(msg.equals(""))
                        {
                            msg = codeWsmDo(returnDoCodeId, wfmworkid,startNodeId,wfmId, dataitemid, opPsnId, sysDeptId, tablename,approveComment);
                            if(!msg.equals(""))
                                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                        }
                    }
                }

                if(blnFind)
                {
                    if(msg.equals(""))
                    {
                        datalistDao.updDatas("update wfm_run_worklist set completed='1',approvecomment=?,approve=?,actpsnid=?,approvetime="+ WSoftUtil.dbSqlSysdate() +" where wfmworkid=?", new Object[] {approveComment,flag,opPsnId,wfmworkid});
                        if(formname!=null&&!formname.equals(""))
                        {
                            datalistDao.updDatas("update "+ formname +" set sysstatus='2' where wfmworklistid=?", new Object[] {wfmworkid});
                        }
                        if(!startNeedAll)
                        {
                            datalistDao.updDatas("update wfm_run_worklist set completed='1',approvecomment='',actpsnid=? where isnew='0' and wfmid=? and dataitemid=? and tblname=? and wfmnodeid=? and completed='0' and isold='0' " , new Object[] {opPsnId,wfmId,dataitemid,tablename,startNodeId}); 
                            datalistDao.updDatas("update wfm_run_node set completed='1' where isnew='0' and wfmid=? and dataitemid=? and tblname=? and wfmnodeid=? and completed='0' and isold='0' ", new Object[] {wfmId,dataitemid,tablename,startNodeId});
                        }
                        WSoftUtil.dbUpdDataUpdTime(datalistDao, tablename); 
                        WSoftUtil.dbUpdDataUpdTime(datalistDao, "wfm_run_worklist");
                    }
                }
                else
                {
                    msg = WSoftMsg.getMsgItem("wfm_noconfigsub",lan);
                }
            }
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    private String codeWsmDo(String strCode,Integer wskId,String nodeId,Integer wfmId,Integer dataitemid,Integer sysPsnId,Integer sysDeptId,String tblname,String appComment) throws Throwable  
    {

        if(strCode==null||strCode.equals(""))
            return "";

        Map<String,String> mpSource = new HashMap<>();
        mpSource.put("source","");
        WSoftUtil.codeGetSources(dService, strCode, mpSource, false,redisCache);
        String strSource = mpSource.get("source");

        if(strSource.trim().equals(""))
            return "";

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript"); 
        
        Bindings bind = engine.createBindings();  
        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
        Map<String,Object> mapPara = new HashMap<>();
        mapPara.put("_returnVal_","");
        mapPara.put("wfmId",wfmId);
        mapPara.put("wfmNodeId",nodeId);
        mapPara.put("wfmWorklistId",wskId);
        mapPara.put("wfmDataTable",tblname);
        mapPara.put("wfmDataId",dataitemid);
        mapPara.put("operatorId",sysPsnId);
        mapPara.put("operatorDeptId",sysDeptId);
        mapPara.put("globalParam_approvalComment",appComment);

        UserLogin userDetails=null;
        if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
                mapPara.put("operatorOrgId",userDetails.getUser().getOrgId());
                mapPara.put("operatorRoles",userDetails.getUser().getRoleIDs());
            }
        }

        bind.put("mapPara", mapPara); 
        bind.put("datalistService", dService); 
        
        try 
        {
            
            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
            CompiledScript script = ((Compilable) engine).compile(strSource);
            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
            //engine.eval(strSource); 

            return (String)mapPara.get("_returnVal_");
        } catch (Exception e) 
        {  
            e.printStackTrace();
            String strError = "[CodeID]"+strCode+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
            throw new RuntimeException("Workflow execution code error:"+strError);
        } 
    }

    private List codeWsmSelPsn(String strCode,Integer wfmId,Integer dataitemid,Integer sysPsnId,Integer sysDeptId,String tblname) throws Throwable 
    {
        List psnlist=new ArrayList<>();
        if(strCode==null||strCode.equals(""))
            return psnlist;

        Map<String,String> mpSource = new HashMap<>();
        mpSource.put("source","");
        WSoftUtil.codeGetSources(dService, strCode, mpSource, false,redisCache);
        String strSource = mpSource.get("source");

        if(strSource.trim().equals(""))
            return psnlist;

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript"); 
        
        Bindings bind = engine.createBindings();  
        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
        Map<String,Object> mapPara = new HashMap<>();
        mapPara.put("_returnVal_","");
        mapPara.put("wfmId",wfmId);
        mapPara.put("wfmDataId",dataitemid);
        mapPara.put("wfmDataTable",tblname);
        mapPara.put("operatorId",sysPsnId);
        mapPara.put("operatorDeptId",sysDeptId);

        UserLogin userDetails=null;
        if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
                mapPara.put("operatorOrgId",userDetails.getUser().getOrgId());
                mapPara.put("operatorRoles",userDetails.getUser().getRoleIDs());
            }
        }

        bind.put("mapPara", mapPara); 
        bind.put("datalistService", dService); 
        
        try 
        {
            
            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
            CompiledScript script = ((Compilable) engine).compile(strSource);
            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
            //engine.eval(strSource); 

            Object revalue=mapPara.get("_returnVal_");
            if(revalue!=null&&(!revalue.toString().equals("")))
            {
                Class cls = revalue.getClass();
                if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
                {
                    ScriptObjectMirror jsOriginal = (ScriptObjectMirror)revalue;
                    if (jsOriginal.isArray()) 
                    {
                        List<Object> lsub = new ArrayList<>();
                        Integer length = (Integer)jsOriginal.get("length");
                        for (int i = 0; i < length; i++) {
                            lsub.add(jsOriginal.get(""+Integer.toString(i)));
                        }
                        psnlist = lsub;
                    }
                }
                else if(cls.getName().equals("java.util.ArrayList"))
                {
                    psnlist = (List)revalue;
                }
                else if(cls.getName().equals("java.lang.Double"))
                {
                    HashMap<String,Object> mp = new HashMap<>();
                    double dv = (double)revalue;
                    mp.put("psnid",(int)dv);
                    psnlist.add(mp);
                }
                else if(cls.getName().equals("com.alibaba.fastjson.JSONArray"))
                {
                    JSONArray jArrCode = (JSONArray)revalue;
                    for(int i=0;i<jArrCode.size();i++)
                    {
                        JSONObject job = jArrCode.getJSONObject(i);
                        HashMap<String,Object> mp = new HashMap<>();
                        mp.put("psnid",Integer.valueOf(job.get("PSNID").toString()));
                        psnlist.add(mp);
                    }
                }
            }
        } catch (Exception e) 
        {  
            e.printStackTrace();
            String strError = "[CodeID]"+strCode+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
            throw new RuntimeException("Get workflow personnel error:"+strError);
        } 
        return psnlist;
    }

    @Transactional
    private boolean checkNodeRule(JSONObject jrulePara,Integer wfmId,Integer dataitemid,String pageSourceId,String pageTargetId,Integer sysPsnId,Integer sysDeptId,String tblname) throws Throwable
    {
        List<Object> lcons=(List<Object>)jrulePara.get("rules");
        for(int j=0;j<lcons.size();j++)
        {
            Map<String,String> mcons=(Map)lcons.get(j); 
            String sourceId = mcons.get("conSId").toString();
            String targetId = mcons.get("conTId").toString();
            if(pageSourceId.equalsIgnoreCase(sourceId)&&pageTargetId.equalsIgnoreCase(targetId))
            {
                if(!mcons.containsKey("rule_code"))
                    return true;

                String strCode = mcons.get("rule_code").toString();
                if(strCode.equals(""))
                    return true;

                Map<String,String> mpSource = new HashMap<>();
                mpSource.put("source","");
                WSoftUtil.codeGetSources(dService, strCode, mpSource, false,redisCache);
                String strSource = mpSource.get("source");

                if(strSource.trim().equals(""))
                    return true;

                ScriptEngineManager factory = new ScriptEngineManager();
                ScriptEngine engine = factory.getEngineByName("JavaScript"); 
                
                Bindings bind = engine.createBindings();  
                engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                Map<String,Object> mapPara = new HashMap<>();
                mapPara.put("_returnVal_","");
                mapPara.put("wfmId",wfmId);
                mapPara.put("wfmDataId",dataitemid);
                mapPara.put("wfmDataTable",tblname);
                mapPara.put("operatorId",sysPsnId);
                mapPara.put("operatorDeptId",sysDeptId);

                UserLogin userDetails=null;
                if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
                {
                    UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
                    if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
                    { 
                        userDetails = (UserLogin)authenticationToken.getPrincipal();
                        mapPara.put("operatorOrgId",userDetails.getUser().getOrgId());
                        mapPara.put("operatorRoles",userDetails.getUser().getRoleIDs());
                    }
                }
                
                bind.put("mapPara", mapPara); 
                bind.put("datalistService", dService); 
                
                try 
                {
                    
                    //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                    CompiledScript script = ((Compilable) engine).compile(strSource);
                    script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                    //engine.eval(strSource); 

                    String strReturn = mapPara.get("_returnVal_").toString();
                    if(strReturn.equalsIgnoreCase("true"))
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                } catch (Exception e) 
                {  
                    e.printStackTrace();
                    String strError = "[CodeID]"+strCode+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
                    throw new RuntimeException("Workflow rule validation error:"+strError);
                } 
            }
        }
        return true;
    }

    private boolean chkNodeNeedBefore(JSONObject jRule,JSONObject jData,Integer wfmId,String pageSourceId,String pageTargetId,Integer dataitemid,String tblname)  throws Throwable  
    {
        Map<String,String> mnode = getTargetNode(pageTargetId, jData);
        if(mnode.containsKey("needbefore")&&!mnode.get("needbefore").equals(""))
        {
            List<Object> lcons=(List<Object>)jData.get("connections");
            for(int j=0;j<lcons.size();j++)
            {
                Map<String,String> mcons=(Map)lcons.get(j); 
                String sourceId = mcons.get("pageSourceId").toString();
                String targetId = mcons.get("pageTargetId").toString();
                if(pageTargetId.equalsIgnoreCase(targetId)&&!sourceId.equals(pageSourceId))
                {
                    List lnode =  datalistDao.getDatas("select wfmid from wfm_run_node where isold='0' and completed='1' and dataitemid=? and tblname=? and wfmnodeid=? " , new Object[] {dataitemid,tblname,sourceId});
                    if(lnode.size()==0)
                    {
                        return true;
                    }
                }
            }
        }
        else
        {
            return false;
        }
        return false;
    }

    @Transactional
    private Boolean setNodepsn(Map<String,String> mt,Integer wfmId,Integer dataitemid,String pageTargetId,String dataitemname,Integer opPsnId,Integer sysDeptId,Integer sysOrgId,String tblname,String msgMode,String lan,String appname)  throws Throwable 
    {
        List lpsn = new ArrayList<>();
        if(!mt.containsKey("psnmode"))
            return false;
        String formname="";
        if(!mt.get("formname").equals(""))
        {
            formname = mt.get("formname").toString();
        }   

        if(mt.get("psnmode").equals("psn"))
        {
            if(!mt.get("psn").equals(""))
            {
                Integer psnId = Integer.valueOf(mt.get("psn").toString());
                HashMap<String,Object> mp = new HashMap<>();
                mp.put("psnid",psnId);
                lpsn.add(mp);
            }
        }
        else if(mt.get("psnmode").equals("dutytree"))
        {
            if(!mt.get("dutytree").equals(""))
            {
                String dutytbl = mt.get("dutytree");
                List lduty =  datalistDao.getDatas("select psnids from "+ dutytbl +" where id in (select pid from "+ dutytbl +" where " + WSoftUtil.dbSqlLikeByField("psnids") + ")" , new Object[] {","+ String.valueOf(opPsnId) +","});
                if(lduty.size()>0)
                {
                    Map<String,Object> mduty = (Map<String,Object>)lduty.get(0);
                    if(mduty.get("psnids")!=null&&!mduty.get("psnids").toString().equals(""))
                    {
                        String psnIDS = mduty.get("psnids").toString();
                        String psnArrs[] = psnIDS.split(",");
                        for(int k=0;k<psnArrs.length;k++)
                        {
                            HashMap<String,Object> mp = new HashMap<>();
                            mp.put("psnid",Integer.valueOf(psnArrs[k]));
                            lpsn.add(mp);
                        }
                    }
                }
            }
        }
        else if(mt.get("psnmode").equals("selpsn"))
        {
            if(!mt.get("selpsn").equals(""))
            {
                lpsn = this.codeWsmSelPsn(mt.get("selpsn").toString(), wfmId, dataitemid, dataitemid, sysDeptId, tblname);
            }
        }
        else if(mt.get("psnmode").equals("role"))
        {
            if(!mt.get("role").toString().equals(""))
            {
                String roleMode = String.valueOf(mt.get("roleindept")).trim();
                Integer roleId = Integer.valueOf(mt.get("role").toString());
                
                String subSql = "";
                List lrole =  (List)datalistDao.getDatas("select roleid from role where roleid=? and (isorg='1' or roleid in (select roleid from org_role where orgid=?)) " , new Object[] {roleId,sysOrgId});
                if(lrole.size()>0)
                {
                    subSql = " pr.orgid="+ sysOrgId +" and ";
                }

                if(roleMode.equals(""))
                {
                    lpsn =  (List)datalistDao.getDatas("select p.psnid from psn p,psn_org po,psn_role pr  where "+ subSql +" p.psnid=pr.psnid and p.psnid=po.psnid  and pr.roleid =? and po.deptid=? and po.orgid="+ sysOrgId +" " , new Object[] {roleId,sysDeptId});
                    if(lpsn.size()==0)
                    {
                        lpsn =  datalistDao.getDatas("select p.psnid from psn p  where p.psnid in (select psnid from psn_role where roleid =?) " , new Object[] {roleId});
                    }
                }
                else if(roleMode.equals("dept"))
                {
                    lpsn =  (List)datalistDao.getDatas("select p.psnid from psn p,psn_org po,psn_role pr  where  "+ subSql +"  p.psnid=pr.psnid and p.psnid=po.psnid  and pr.roleid =? and po.deptid=? and po.orgid="+ sysOrgId +" " , new Object[] {roleId,sysDeptId});
                }
                else if(roleMode.equals("deptup"))
                {
                    lpsn =  (List)datalistDao.getDatas("select p.psnid from psn p,psn_org po,psn_role pr  where  "+ subSql +"  p.psnid=pr.psnid and p.psnid=po.psnid  and pr.roleid =? and po.deptid in (select pid from dept where deptid=?) and po.orgid="+ sysOrgId +" " , new Object[] {roleId,sysDeptId});
                }
                else if(roleMode.equals("deptall"))
                {
                    lpsn =  (List)datalistDao.getDatas("select p.psnid from psn p,psn_org po,psn_role pr  where  "+ subSql +"  p.psnid=pr.psnid and p.psnid=po.psnid  and pr.roleid =? and po.deptid=? and po.orgid="+ sysOrgId +" " , new Object[] {roleId,sysDeptId});
                    if(lpsn.size()==0)
                    {
                        lpsn =  (List)datalistDao.getDatas("select p.psnid from psn p,psn_org po,psn_role pr  where  "+ subSql +"  p.psnid=pr.psnid and p.psnid=po.psnid  and pr.roleid =? and po.deptid in (select pid from dept where deptid=?) and po.orgid="+ sysOrgId +" " , new Object[] {roleId,sysDeptId});
                    }
                }
                else if(roleMode.equals("org"))
                {
                    lpsn =  (List)datalistDao.getDatas("select p.psnid from psn p,psn_org po,psn_role pr  where  "+ subSql +"  p.psnid=pr.psnid and p.psnid=po.psnid  and pr.roleid =? and po.orgid=? " , new Object[] {roleId,sysOrgId});
                }
            }
        }

        if(lpsn.size()>0)
        {
            Map<String,Object> mpsnlist = new HashMap<>();
            dealWfmEntrustPsn(wfmId,lpsn,mpsnlist);
            datalistDao.addDatas("insert into wfm_run_node(wfmid,dataitemid,tblname,wfmnodeid) values(?,?,?,?)", new Object[] {wfmId,dataitemid,tblname,pageTargetId});
            
            String psndo=",";
            Set<String> keyMp = mpsnlist.keySet();
            for (String psnId : keyMp) 
            {
                if(psndo.indexOf(","+psndo+",")>=0)
                {
                    continue;
                }
                String wrlid = WSoftUtil.dbSqlAutoIDGet(datalistDao,"wfm_run_worklist","wfmworkid");
                datalistDao.addDatas("insert into wfm_run_worklist(wfmworkid,wfmid,dataitemid,wfmnodeid,dataitemname,psnid,tblname,formname,appname) values(?,?,?,?,?,?,?,?,?)", new Object[] {wrlid,wfmId,dataitemid,pageTargetId,dataitemname,psnId,tblname,formname,appname});
                sendEmailApp(psnId,dataitemname,msgMode,lan);
                psndo = psndo + psnId + ",";

            }
            return true;
        }
        return false;
    }

    private void sendEmailApp(String psnID,String dataitemName,String msgMode,String lan) throws Throwable 
    {
        if(msgMode.equals("0"))
        {
            return;
        }
        Map<String,Object> mp = (Map<String,Object>)datalistDao.getDataSingle("select name,email,mobile from psn where psnid=? " , new Object[] {psnID});
        if(mp!=null)
        {
            String psnName = "";
            String psnEmail = "";
            String psnMobile = "";
            if(mp.get("name")!=null)
                psnName =  mp.get("name").toString();
            if(mp.get("email")!=null)
                psnEmail =  mp.get("email").toString();
            if(mp.get("mobile")!=null)
                psnMobile =  mp.get("mobile").toString();
            
            if(!psnEmail.equals("")&&(msgMode.equals("1")||msgMode.equals("3")))
            {
                String mguid="938d9312aba14db78dbc080271c8eb4a";
                if(lan.equals("e"))
                {
                    mguid="938d9312aba14db78dbc080271c8eb11"; 
                }

                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid",mguid);
                mt.put("msg#approver",psnName);
                mt.put("msg#itemName",dataitemName);
                mt.put("msg#toaddr",psnEmail);
                dService.codeMsgAdd(mt);
            }

            if(!psnMobile.equals("")&&(msgMode.equals("2")||msgMode.equals("3")))
            {
                String mguid="6311912759cd470093c176b671d932f3";
                if(lan.equals("e"))
                {
                    mguid="6311912759cd470093c176b671d93211"; 
                }

                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid",mguid);
                mt.put("msg#approver",psnName);
                mt.put("msg#itemName",dataitemName);
                mt.put("msg#toaddr",psnMobile);
                dService.codeMsgAdd(mt);
            }

        }
    }

    private void sendEmailReject(String dataid,String dataitemName,String tblname,String rejectCon,String msgMode,String lan) throws Throwable 
    {
        if(msgMode.equals("0"))
        {
            return;
        }
        Map<String,Object> mp = (Map<String,Object>)datalistDao.getDataSingle("select name,email,mobile from psn where psnid = (select syspsnid from "+ tblname+" where id=?)  " , new Object[] {dataid});
        if(mp!=null)
        {
            String psnName = "";
            String psnEmail = "";
            String psnMobile = "";
            if(mp.get("name")!=null)
                psnName =  mp.get("name").toString();
            if(mp.get("email")!=null)
                psnEmail =  mp.get("email").toString();
            if(mp.get("mobile")!=null)
                psnMobile =  mp.get("mobile").toString();
            
            if(!psnEmail.equals("")&&(msgMode.equals("1")||msgMode.equals("3")))
            {
                String mguid="2416e1cb406a42f08114f93ac74540df";
                if(lan.equals("e"))
                {
                    mguid="2416e1cb406a42f08114f93ac7454011"; 
                }

                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid",mguid);
                mt.put("msg#submitter",psnName);
                mt.put("msg#itemName",dataitemName);
                mt.put("msg#rejectReason",rejectCon);
                mt.put("msg#toaddr",psnEmail);
                dService.codeMsgAdd(mt);
            }

            if(!psnMobile.equals("")&&(msgMode.equals("2")||msgMode.equals("3")))
            {
                String mguid="b00d25a4dc9641348451cbebaca61d63";
                if(lan.equals("e"))
                {
                    mguid="b00d25a4dc9641348451cbebaca61d11"; 
                }

                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid",mguid);
                mt.put("msg#submitter",psnName);
                mt.put("msg#itemName",dataitemName);
                mt.put("msg#rejectReason",rejectCon);
                mt.put("msg#toaddr",psnMobile);
                dService.codeMsgAdd(mt);
            }

        }
    }

    private void sendEmailCompleted(String dataid,String dataitemName,String tblname,String appCon,String msgMode,String lan) throws Throwable 
    {
        if(msgMode.equals("0"))
        {
            return;
        }

        Map<String,Object> mp = (Map<String,Object>)datalistDao.getDataSingle("select name,email,mobile from psn where psnid = (select syspsnid from "+ tblname+" where id=?)  " , new Object[] {dataid});
        if(mp!=null)
        {
            String psnName = "";
            String psnEmail = "";
            String psnMobile = "";
            if(mp.get("name")!=null)
                psnName =  mp.get("name").toString();
            if(mp.get("email")!=null)
                psnEmail =  mp.get("email").toString();
            if(mp.get("mobile")!=null)
                psnMobile =  mp.get("mobile").toString();
            
            if(!psnEmail.equals("")&&(msgMode.equals("1")||msgMode.equals("3")))
            {
                String mguid="80eebdaa02d9452985e99babd19696df";
                if(lan.equals("e"))
                {
                    mguid="80eebdaa02d9452985e99babd1969611"; 
                }

                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid",mguid);
                mt.put("msg#submitter",psnName);
                mt.put("msg#itemName",dataitemName);
                mt.put("msg#approvalComment",appCon);
                mt.put("msg#toaddr",psnEmail);
                dService.codeMsgAdd(mt);
            }

            if(!psnMobile.equals("")&&(msgMode.equals("2")||msgMode.equals("3")))
            {
                String mguid="face4cc8ddb64d2f8e6748f3916f5e82";
                if(lan.equals("e"))
                {
                    mguid="face4cc8ddb64d2f8e6748f3916f5e11"; 
                }

                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid",mguid);
                mt.put("msg#submitter",psnName);
                mt.put("msg#itemName",dataitemName);
                mt.put("msg#approvalComment",appCon);
                mt.put("msg#toaddr",psnMobile);
                dService.codeMsgAdd(mt);
            }

        }
    }

    private void dealWfmEntrustPsn(Integer wfmId,List lpsn,Map<String,Object> mpsnlist) throws Throwable 
    {
        String psnIDList = "";
        for(int k=0;k<lpsn.size();k++)
        {
            Map<String,Object> mpsn=(Map)lpsn.get(k);
            String psnId = mpsn.values().toArray()[0].toString();
            mpsnlist.put(psnId,"");

            String enSql = "select psnidlist from wfm_entrust where wfmid=? and psnid=?";
            List enlpsn =  (List)datalistDao.getDatas(enSql, new Object[] {wfmId,psnId});
            for(int i=0;i<enlpsn.size();i++)
            {
                Map<String,Object> rnmp=(Map)enlpsn.get(i);
                psnIDList = psnIDList + rnmp.get("psnidlist").toString() + ",";
            }
        }

        if(!psnIDList.equals(""))
        {
            psnIDList = WSoftUtil.strDelLastComma(psnIDList);
            String arrPsnids[] = psnIDList.split(",");
            for(int j=0;j<arrPsnids.length;j++)
            {
                mpsnlist.put(arrPsnids[j],"");
            }
        }

    }

    @Transactional
    public List getWfmworklist(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable
    {
        if(jsonObject.containsKey("wfmworklistid")&&jsonObject.get("wfmworklistid")!=null)
        {
            UserLogin userDetails=null;
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
            
            String wfmworklistid = jsonObject.getString("wfmworklistid");
            if(!wfmworklistid.equals(""))
            {
                String strSql = "select dataitemid,tblname,formname from wfm_run_worklist where wfmworkid=? and psnid=?";
                List dataWfm = dService.getDatasBySql(strSql, new Object[]{wfmworklistid,userDetails.getUser().getId()});
                if(dataWfm.size()>0)
                {
                    Map<String,Object> mp = (Map<String,Object>)dataWfm.get(0);
                    String sql ="select w.ISOLD,w.WFMNODEID,w.WFMWORKID,w.COMPLETED,"+ WSoftUtil.dbSqlDateTimeStr("approvetime") + ",w.APPROVECOMMENT,w.FORMNAME,p.psnid as PSNID,p.name as PSNNAME,p.email as PSNEMAIL  from wfm_run_worklist w,psn p where (w.completed='0' or (w.completed='1' and w.approvetime is not null) ) and w.psnid=p.psnid and w.dataitemid= ? and w.tblname=? and wfmworkid<=? order by w.wfmworkid";
                    List lwsm =  datalistDao.getDatasWeb( sql, new Object[] {mp.get("dataitemid").toString(),mp.get("tblname").toString(),wfmworklistid});
                    return lwsm;
                }
            }
        }
        else
        {
            List ldata = dService.getDataItem(viewCode, itemIDs, jsonObject,false);
            List dataitem = (List)ldata.get(0);
            if(dataitem.size()>0)
            {
                String sql ="select w.ISOLD,w.WFMNODEID,w.WFMWORKID,w.COMPLETED,"+ WSoftUtil.dbSqlDateTimeStr("approvetime") + ",w.APPROVECOMMENT,w.FORMNAME,p.psnid as PSNID,p.name as PSNNAME,p.email as PSNEMAIL  from wfm_run_worklist w,psn p where (w.completed='0' or (w.completed='1' and w.approvetime is not null) ) and w.psnid=p.psnid and w.dataitemid= ? and w.tblname=? order by w.wfmworkid";
                List lwsm =  datalistDao.getDatasWeb( sql, new Object[] {itemIDs,viewCode});
                return lwsm;
            }
            else
                return null;
        }
        return null;
    }
    @Transactional
    public HashMap<String,String> submitDatas(String viewCode,String itemIDs,String wfmGuid,JSONObject jsonObject)  throws Throwable
    {
        String msg="";
        String tableName = "";
        String appname="";
        String wfmData="";
        String wfmRule="";
        String wfmdatafieldname="";
        Integer dataitemid = Integer.valueOf(itemIDs);
        String dataitemname = "";
        Integer sysDeptId=Integer.valueOf(jsonObject.getString("deptid"));
        Integer sysOrgId=Integer.valueOf(jsonObject.getString("orgid"));
        Integer opPsnId=Integer.valueOf(jsonObject.getString("psnid"));
        String updData="";
        String msgMode="";
        Integer wfmId =0;

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        List lwsm;
        if(wfmGuid==null || wfmGuid.equals(""))
        {
            lwsm =  datalistDao.getDatas("select w.* from wfm w where w.tblname= ?" , new Object[] {viewCode});
            if(lwsm.size()>0)
            {
                Map<String,Object> mwfm = (Map)lwsm.get(0);
                wfmGuid = (String)mwfm.get("guid");
            }
        }
        else
        {
            lwsm =  datalistDao.getDatas("select w.* from wfm w where w.guid= ?" , new Object[] {wfmGuid});
        }
        if(lwsm.size()>0)
        {
            Map<String,Object> mwsm=(Map)lwsm.get(0);
            tableName = (String)mwsm.get("tblname");
            wfmId = Integer.parseInt(mwsm.get("wfmId").toString());
            wfmdatafieldname = (String)mwsm.get("datanamefield");
            updData = (String)mwsm.get("upddata");
            msgMode = (String)mwsm.get("msgmode");

            if(tableName.indexOf("tbl")==0)
            {
                String chkUpdSql="select id from "+ tableName + " where id=? and sysstatus='0' ";
                List updDatalist = datalistDao.getDatas(chkUpdSql,new Object[]{itemIDs});
                if(updDatalist.size()==0)
                {
                    msg = WSoftMsg.getMsgItem("wfm_datasub",lan) + "(" + tableName + ")";
                }

                chkUpdSql="select name from data where tablename=?";
                Map<String,Object> mapp = datalistDao.getDataSingle(chkUpdSql,new Object[]{tableName});
                appname = mapp.get("name").toString();

            }

            if(msg.equals(""))
            {
                if(mwsm.get("wfmData")!=null)
                {
                    wfmData = (String)mwsm.get("wfmData");
                    wfmRule = (String)mwsm.get("wfmRule");

                    wfmData = WSoftUtil.readWfmFile(wfmData);
                    wfmRule = WSoftUtil.readWfmFile(wfmRule);
                }
                else
                {
                    msg = WSoftMsg.getMsgItem("wfm_noconfig",lan);
                }
            }

            Boolean isFormPub=false;
            if(jsonObject.containsKey("FORMPUB")&&jsonObject.getBoolean("FORMPUB"))
            {
                isFormPub = true;
            }

            String strPkey = "id";
            List ldataitem = null;

            if(isFormPub)
            {
                String dguid = jsonObject.get("dguid").toString();
                ldataitem =  datalistDao.getDatas("select "+ wfmdatafieldname +" from "+ tableName +" where " + strPkey +"= ? and dguid=?" , new Object[] {dataitemid,dguid});
            }
            else
            {
                ldataitem =  datalistDao.getDatas("select "+ wfmdatafieldname +" from "+ tableName +" where " + strPkey +"= ? and syspsnid=?" , new Object[] {dataitemid,opPsnId});
            }
            
            if(msg.equals("")&&ldataitem.size()>0)
            {
                Map<String,Object> mdataitem=(Map)ldataitem.get(0);
                Object objmd = mdataitem.get(wfmdatafieldname);
                if (objmd instanceof String) {
                    dataitemname = (String) objmd;
                } else if (objmd != null) {
                    dataitemname = objmd.toString(); 
                }

                JSONObject jsonwsmData = (JSONObject)JSON.parse(wfmData);
                JSONObject jrulePara = (JSONObject)JSON.parse(wfmRule);

                String startNodeId = "";
                String targetNodeId="";
                String strEndDoCodeId =""; 
                Boolean blnEndDoCode =false;
                String strStartDoCodeId="";

                String initDoCodeId="";
                initDoCodeId = jsonwsmData.get("initdo").toString();
                
                List<Object> lnodes=(List<Object>)jsonwsmData.get("nodes");
                for(int j=0;j<lnodes.size();j++)
                {
                    Map<String,String> mnodes=(Map)lnodes.get(j);
                    String nodeName = mnodes.get("name").toString();
                    if(nodeName.equalsIgnoreCase("Start"));
                    {
                        startNodeId = mnodes.get("nodeId").toString();
                        if(mnodes.containsKey("enddo"))
                            strEndDoCodeId = mnodes.get("enddo").toString();
                        break;
                    }
                }

                msg = codeWsmDo(initDoCodeId,0,targetNodeId,wfmId, dataitemid, opPsnId, sysDeptId,tableName,"");
                if(!msg.equals(""))
                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

                if(startNodeId.equals("")||!msg.equals(""))
                {
                    if(msg.equals(""))
                        msg = WSoftMsg.getMsgItem("wfm_noconfig",lan);
                }
                else
                {

                    boolean blnFind=false;
                    List<Object> lcons=(List<Object>)jsonwsmData.get("connections");
                    for(int j=0;j<lcons.size();j++)
                    {
                        Map<String,String> mcons=(Map)lcons.get(j); 
                        String pageSourceId = mcons.get("pageSourceId").toString();
                        String pageTargetId = mcons.get("pageTargetId").toString();
                        if(pageSourceId.equalsIgnoreCase(startNodeId))
                        {
                            Map<String,String> mnodetarget =getTargetNode(pageTargetId,jsonwsmData);
                            if(mnodetarget.containsKey("startdo"))
                                strStartDoCodeId = mnodetarget.get("startdo").toString();
                            String nodeName = mnodetarget.get("name").toString();
                            if(!nodeName.equalsIgnoreCase("End"))
                            {
                                if(checkNodeRule(jrulePara,wfmId,dataitemid,pageSourceId,pageTargetId,opPsnId,sysDeptId,tableName))
                                {
                                    if(setNodepsn(mnodetarget,wfmId, dataitemid, pageTargetId, dataitemname,opPsnId,sysDeptId,sysOrgId,tableName,msgMode,lan,appname))
                                    {
                                        targetNodeId = pageTargetId;
                                        blnFind=true;

                                        if(!blnEndDoCode)
                                        {
                                            msg = codeWsmDo(strEndDoCodeId,0,startNodeId, wfmId, dataitemid, opPsnId, sysDeptId,tableName,"");
                                            if(!msg.equals(""))
                                                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                            else
                                                blnEndDoCode=true;
                                        }
                                        
                                        if(msg.equals(""))
                                        {
                                            msg = codeWsmDo(strStartDoCodeId,0,targetNodeId,wfmId, dataitemid, opPsnId, sysDeptId,tableName,"");
                                            if(!msg.equals(""))
                                                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                        }
                                    }
                                }
                            }
                            else
                            {
                                if(checkNodeRule(jrulePara,wfmId,dataitemid,pageSourceId,pageTargetId,opPsnId,sysDeptId,tableName))
                                {
                                    if(updData.equals("1"))
                                    {
                                        datalistDao.updDatas("update " + tableName + " set sysstatus='2' where  " + strPkey +"= ? " , new Object[] {dataitemid});
                                        WSoftUtil.dbUpdDataUpdTime(datalistDao, tableName);
                                    }
                                    blnFind=true;

                                    msg = codeWsmDo(strEndDoCodeId,0,startNodeId, wfmId, dataitemid, opPsnId, sysDeptId,tableName,"");
                                    if(!msg.equals(""))
                                        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

                                    if(msg.equals(""))
                                    {
                                        msg = codeWsmDo(strStartDoCodeId,0,targetNodeId,wfmId, dataitemid, opPsnId, sysDeptId,tableName,"");
                                        if(!msg.equals(""))
                                            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                                    }
                                }

                            }
                        }
                    }
                    if(blnFind)
                    {
                        if(msg.equals(""))
                        {
                            if(updData.equals("1"))
                            {
                                datalistDao.updDatas("update " + tableName + " set sysstatus='1' where sysstatus='0' and " + strPkey +"= ? " , new Object[] {dataitemid});
                                WSoftUtil.dbUpdDataUpdTime(datalistDao, tableName);
                                WSoftUtil.dbUpdDataUpdTime(datalistDao, "wfm_run_worklist");
                            }
                        }
                    }
                    else
                        msg = WSoftMsg.getMsgItem("wfm_noconfigsub",lan);
                }
            }
        }
        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    public static Map<String,String> getTargetNode(String targetNodeId,JSONObject jsonwsmData)
    {
        List<Object> lnodes=(List<Object>)jsonwsmData.get("nodes");
        for(int j=0;j<lnodes.size();j++)
        {
            Map<String,String> mnodes=(Map)lnodes.get(j);
            String nodeId = mnodes.get("nodeId").toString();
            if(nodeId.equalsIgnoreCase(targetNodeId))
            {
                return mnodes;
            }
        }
        return null;
    }

    //Get subsequent nodes; could consider caching
    private void findAfterNodes(String targetNodeId,Map<String,String> mnodes,List<Object> lcons)
    {
        if(mnodes.containsKey(targetNodeId))
        {
            return;
        }
        else
        {
            mnodes.put(targetNodeId, "");
        }

        for(int j=0;j<lcons.size();j++)
        {
            Map<String,String> mp=(Map)lcons.get(j);
            String pageSourceId = mp.get("pageSourceId").toString();
            String pageTargetId = mp.get("pageTargetId").toString();
            if(pageSourceId.equalsIgnoreCase(targetNodeId))
            {
                findAfterNodes(pageTargetId,mnodes,lcons);
            }
        }
    }

}
