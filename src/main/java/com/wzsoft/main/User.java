package com.wzsoft.main;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * User entity class
 *
 * @author WedGeng
 */
public class User implements Serializable {
    private static final long serialVersionUID = -40356785423868312L;
    
    private Long id;
    private String userName;
    private String name;
    private String password;
    private String cpachacode;
    private String email;
    private String phonenumber;
    private String smscode;
    private Long deptId;
    private String deptName;
    private String appType;
    private Long parentDeptId;
    private String parentDeptName;
    private Long orgId;
    private String orgName;
    private List roles;
    private List roleAppPc;
    private List roleAppMobile;
    private List rolePage;
    private String rolesOrg;
    private List roleDataView;
    private List subDepts;
    private String subDeptIDs;
    private String roleIDs;
    private String lan;
    private String pagepara;
    private List rolesAll;
    private String reurl;

    private String loginorgid;
    private String loginroleid;

    public void setLoginorgid(String loginorgid)
    {
        this.loginorgid = loginorgid;
    }

    public String getLoginorgid()
    {
        return this.loginorgid;
    }

    public void setLoginroleid(String loginroleid)
    {
        this.loginroleid = loginroleid;
    }

    public String getLoginroleid()
    {
        return this.loginroleid;
    }

    public void setReurl(String reurl)
    {
        this.reurl = reurl;
    }

    public String getReurl()
    {
        return this.reurl;
    }

    public void setLan(String lan)
    {
        this.lan = lan;
    }

    public String getLan()
    {
        return this.lan;
    }

    public void setPagepara(String pagepara)
    {
        this.pagepara = pagepara;
    }

    public String getPagepara()
    {
        return this.pagepara;
    }

    public void setAppType(String appType)
    {
        this.appType = appType;
    }

    public String getAppType()
    {
        return this.appType;
    }

    public void setRoleIDs(String roleIDs)
    {
        this.roleIDs = roleIDs;
    }

    public String getRoleIDs()
    {
        return this.roleIDs;
    }

    public void setDeptId(Long deptId)
    {
        this.deptId = deptId;
    }

    public Long getDeptId()
    {
        return this.deptId;
    }

    public void setParentDeptId(Long parentDeptId)
    {
        this.parentDeptId = parentDeptId;
    }

    public Long getParentDeptId()
    {
        return this.parentDeptId;
    }

    public void setParentDeptName(String deptName)
    {
        this.parentDeptName = deptName;
    }

    public String getParentDeptName()
    {
        return this.parentDeptName;
    }

    public void setOrgId(Long orgId)
    {
        this.orgId = orgId;
    }

    public Long getOrgId()
    {
        return this.orgId;
    }

    public void setSubDepts(List subDepts)
    {
        this.subDepts = subDepts;
    }

    public List getSubDepts()
    {
        return this.subDepts;
    }

    public void setRoles(List roles)
    {
        this.roles = roles;
    }

    public String getRolesOrg()
    {
        return this.rolesOrg;
    }

    public void setRolesOrg(String roles)
    {
        this.rolesOrg = roles;
    }

    public String getSubDeptIDs()
    {
        return this.subDeptIDs;
    }

    public void setSubDeptIDs(String depts)
    {
        this.subDeptIDs = depts;
    }
    
    public List getRoles()
    {
        return this.roles;
    }

    public void setRolesAll(List roles)
    {
        this.rolesAll = roles;
    }

    public List getRolesAll()
    {
        return this.rolesAll;
    }

    public void setRoleAppPc(List roleApp)
    {
        this.roleAppPc = roleApp;
    }

    public List getRoleAppPc()
    {
        return this.roleAppPc;
    }

    public void setRoleAppMobile(List roleApp)
    {
        this.roleAppMobile = roleApp;
    }

    public List getRoleAppMobile()
    {
        return this.roleAppMobile;
    }

    public void setRolePage(List rolePage)
    {
        this.rolePage = rolePage;
    }

    public List getRolePage()
    {
        return this.rolePage;
    }
    public void setRoleDataView(List roleDataView)
    {
        this.roleDataView = roleDataView;
    }

    public List getRoleDataView()
    {
        return this.roleDataView;
    }
    public void setName(String name)
    {
        this.name = name;
    }

    public String getName()
    {
        return this.name;
    }
    public void setOrgName(String orgName)
    {
        this.orgName = orgName;
    }

    public String getOrgName()
    {
        return this.orgName;
    }

    public void setDeptName(String deptName)
    {
        this.deptName = deptName;
    }

    public String getDeptName()
    {
        return this.deptName;
    }

    public void setUserName(String userName)
    {
        this.userName = userName;
    }

    public String getUserName()
    {
        return this.userName;
    }

    public void setPassword(String password)
    {
        this.password = password;
    }

    public String getPassword()
    {
        return this.password;
    }

    public void setCpachacode(String cpachacode)
    {
        this.cpachacode = cpachacode;
    }

    public String getCpachacode()
    {
        return this.cpachacode;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }

    public String getEmail()
    {
        return this.email;
    }

    public void setPhonenumber(String phonenumber)
    {
        this.phonenumber = phonenumber;
    }

    public String getPhonenumber()
    {
        return this.phonenumber;
    }

    public void setSmscode(String smscode)
    {
        this.smscode = smscode;
    }

    public String getSmscode()
    {
        return this.smscode;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getId()
    {
        return this.id;
    }
}

