package com.wzsoft.main;
import java.util.HashMap;

public class WSoftMsg 
{
    
    private static HashMap<String, String> gGlobalMsgConst  = new HashMap(){{
        put("login_err_c","Invalid username or password");
        put("login_err_e","Incorrect username or password");
        put("login_noapp_c","Application not configured");
        put("login_noapp_e","Application not configured");
        put("login_emailnoreg_c","This email is not registered");
        put("login_emailnoreg_e","This email is not registered");
        put("login_emailnull_c","Email cannot be empty");
        put("login_emailnull_e","Email cannot be empty");
        put("login_mobilenoreg_c","This phone is not registered");
        put("login_mobilenoreg_e","This phone is not registered");
        put("login_mobilenull_c","Mobile cannot be empty");
        put("login_mobilenull_e","Mobile cannot be empty");
        put("login_emailreg_c","Email registered");
        put("login_emailreg_e","Email registered");
        put("login_mobilereg_c","Mobile registered");
        put("login_mobilereg_e","Mobile registered");
        put("login_orgname_c","The organization name cannot be empty");
        put("login_orgname_e","The organization name cannot be empty");
        put("login_adminname_c","The admin name cannot be empty");
        put("login_adminname_e","The admin name cannot be empty");
        put("login_orgnamereg_c","The organization registered");
        put("login_orgnamereg_e","The organization registered ");
        put("login_adminname_c","The admin name cannot be empty");
        put("login_adminname_e","The admin name cannot be empty");
        put("login_infoerr_c","Incomplete information");
        put("login_infoerr_e","Incomplete information");
        put("login_passnomatch_c","The password and the confirm password do not match");
        put("login_passnomatch_e","The password and the confirm password donot match");
        put("login_passurl_c","Link incorrect");
        put("login_passurl_e","Link incorrect");        
        put("login_passurlno_c","Link has expired");
        put("login_passurlno_e","Link has expired");
        put("login_vcodenull_c","Captcha cannot be empty");
        put("login_vcodenull_e","Captcha cannot be empty");
        put("login_vcodeerr_c","Captcha error");
        put("login_vcodeerr_e","Captcha error");
        put("login_vcodemany_c","Captcha operations are too frequent");
        put("login_vcodemany_e","Captcha operations are too frequent");
        put("login_vcodenull1_c","The verification code cannot be empty");
        put("login_vcodenull1_e","The verification code cannot be empty");
        put("login_vcodeerr1_c","The verification code error");
        put("login_vcodeerr1_e","The verification code error");
        put("wfm_datasub_c","The data has been submitted");
        put("wfm_datasub_e","The data has been submitted");
        put("wfm_noconfig_c","The process has not been configured yet");
        put("wfm_noconfig_e","The process has not been configured yet");
        put("wfm_noconfigsub_c","No next process node found");
        put("wfm_noconfigsub_e","No next process node found");
        put("psn_orgjoin_c","You have joined the organization");
        put("psn_orgjoin_e","You have joined the organization");
        put("psn_orgname_c","The organization cannot be empty");
        put("psn_orgname_e","The organization cannot be empty");
        put("psn_orgnote_c","The reason for joining the organization cannot be empty");
        put("psn_orgnote_e","The reason for joining the organization cannot be empty");
        put("psn_deptname_c","The department cannot be empty");
        put("psn_deptname_e","The dept cannot be empty");
        put("psn_deptnote_c","The reason for rejection cannot be empty");
        put("psn_deptnote_e","The reason for rejection cannot be empty");
        put("psn_deptrole_c","Roles cannot be empty");
        put("psn_deptrole_e","Roles cannot be empty");
        put("data_duplic_c"," has duplicate records");
        put("data_duplic_e"," has duplicate records");
        put("data_sub_c","The data has been submitted and cannot be edited again");
        put("data_sub_e","The data has been submitted and cannot be edited again");
        put("psn_passsave_c","Password successfully changed");
        put("psn_passsave_e","Password successfully changed");
        put("psn_passerr_c","The old password error");
        put("psn_passerr_e","The old password error");
    }};

    public static String getMsgItem(String key,String lan)
    {
        if(lan==null)
        {
            lan="c";
        }
        if(gGlobalMsgConst.containsKey(key+"_"+lan))
        {
            return gGlobalMsgConst.get(key+"_"+lan);
        }
        return "";
    }

}
