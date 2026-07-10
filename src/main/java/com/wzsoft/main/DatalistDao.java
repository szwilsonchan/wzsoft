package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.support.AbstractLobCreatingPreparedStatementCallback;
import org.springframework.jdbc.core.support.AbstractLobStreamingResultSetExtractor;
import org.springframework.jdbc.support.lob.DefaultLobHandler;
import org.springframework.jdbc.support.lob.LobCreator;
import org.springframework.jdbc.support.lob.LobHandler;
import org.springframework.stereotype.Repository;
import org.springframework.util.ResourceUtils;

import java.sql.Clob;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class DatalistDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    

    public int updClobDatas(String sql,String dataID,String dataContent){

        LobHandler lobHandler = new DefaultLobHandler();  // reusable object
        
          jdbcTemplate.execute(sql,
                new AbstractLobCreatingPreparedStatementCallback(lobHandler) 
                {
                    protected void setValues(PreparedStatement ps, LobCreator lobCreator) throws SQLException 
                    {
                        lobCreator.setClobAsString(ps, 1, dataContent);
                        ps.setString(2, dataID);
                   }
                 }
             );

        return 1;
    }

    public int addClobDatas(String sql,String dataID,String dataContent){

        LobHandler lobHandler = new DefaultLobHandler();  // reusable object
        
          jdbcTemplate.execute(sql,
                new AbstractLobCreatingPreparedStatementCallback(lobHandler) 
                {
                    protected void setValues(PreparedStatement ps, LobCreator lobCreator) throws SQLException 
                    {
                        ps.setString(1, dataID);
                        lobCreator.setClobAsString(ps, 2, dataContent);
                   }
                 }
             );

        return 1;
    }

    public String getClobDatas(String sql,String fieldName,String dataID)  throws Throwable 
    { 
        Map<String,Object> mp = jdbcTemplate.queryForMap(sql, new Object[] {dataID});
        return mp.get(fieldName).toString();
    }

    public List getDatas(String sql,Object[] args) throws Throwable 
    {

        List list = null;
        try
        {
            list = jdbcTemplate.queryForList(sql, args);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            String strPara="";
            for(int i=0;i<args.length;i++)
            {
                if(args[i]!=null)
                {
                    strPara = strPara + String.valueOf(args[i]) + ";";
                }
            }
            String strError  = strPara + "\n[@sql@]\n" + sql + "\n[@logcontent@]\n" + e.getMessage();
            throw new RuntimeException("Database query error:"+strError);
        }
        return list;
    }

    public List getDatasWeb(String sql,Object[] args) throws Throwable 
    {

        List list = null;
        try
        {
            list = jdbcTemplate.queryForList(sql, args);
            if(WSoftUtil.dbSqlIsKingbase())
            {
                list = WSoftUtil.dbDealListMap(list);
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
            String strPara="";
            for(int i=0;i<args.length;i++)
            {
                if(args[i]!=null)
                {
                    strPara = strPara + String.valueOf(args[i]) + ";";
                }
            }
            String strError  = strPara + "\n[@sql@]\n" + sql + "\n[@logcontent@]\n" + e.getMessage();
            throw new RuntimeException("Database query error:"+strError);
        }
        return list;
    }

    public List getUserDatas(String sql,Object[] args)
    {
        List list = jdbcTemplate.queryForList(sql, args);
        if(WSoftUtil.dbSqlIsKingbase())
        {
            list = WSoftUtil.dbDealListMap(list);
        }
        return list;
    }
    public Map<String,Object> getUserDataSingle(String sql,Object[] args)
    {
        List list = jdbcTemplate.queryForList(sql, args);
        if(WSoftUtil.dbSqlIsKingbase())
        {
            list = WSoftUtil.dbDealListMap(list);
        }
        if(list.size()>0)
        {
            Map<String,Object> mp= (Map)list.get(0);
            return mp;
        }
        return null;
    }
    public Map<String,Object> getDataSingle(String sql,Object[] args)  throws Throwable {

        List list = null;
        try
        {
            list = jdbcTemplate.queryForList(sql, args);
            if(list.size()>0)
            {
                Map<String,Object> mp= (Map)list.get(0);
                return mp;
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
            String strPara="";
            for(int i=0;i<args.length;i++)
            {
                if(args[i]!=null)
                {
                    strPara = strPara + String.valueOf(args[i]) + ";";
                }
            }
            String strError  = strPara + "\n[@sql@]\n" + sql + "\n[@logcontent@]\n" + e.getMessage();
            throw new RuntimeException("Database query error:"+strError);
        }
        return null;
    }
    public int delDatas(String sql,Object[] args) throws Throwable {

        int rows = 0;
        try
        {
            rows = jdbcTemplate.update(sql, args);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            String strPara="";
            for(int i=0;i<args.length;i++)
            {
                if(args[i]!=null)
                {
                    strPara = strPara + String.valueOf(args[i]) + ";";
                }
            }
            String strError  = strPara + "\n[@sql@]\n" + sql + "\n[@logcontent@]\n" + e.getMessage();
            throw new RuntimeException("Delete data error:"+strError);
        }
        return rows;
    }
    public int updDatas(String sql,Object[] args) throws Throwable {

        int rows = 0;
        try
        {
            rows = jdbcTemplate.update(sql, args);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            String strPara="";
            for(int i=0;i<args.length;i++)
            {
                if(args[i]!=null)
                {
                    strPara = strPara + String.valueOf(args[i]) + ";";
                }
            }
            String strError  = strPara + "\n[@sql@]\n" + sql + "\n[@logcontent@]\n" + e.getMessage();
            throw new RuntimeException("Update data error:"+strError);
        }
        return rows;

    }
    public int addDatas(String sql,Object[] args) throws Throwable {

        int rows = 0;
        try
        {
            rows = jdbcTemplate.update(sql, args);
            if(WSoftUtil.dbSqlIsMysql())
            {
                List list = jdbcTemplate.queryForList("SELECT LAST_INSERT_ID() as AUTOID");
                if(list.size()>0)
                {
                    Map<String,Object> mp= (Map)list.get(0);
                    int aid = Integer.valueOf(mp.get("AUTOID").toString());
                    return aid;
                }
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
            String strPara="";
            for(int i=0;i<args.length;i++)
            {
                if(args[i]!=null)
                {
                    strPara = strPara + String.valueOf(args[i]) + ";";
                }
            }
            String strError  = strPara + "\n[@sql@]\n" + sql + "\n[@logcontent@]\n" + e.getMessage();
            throw new RuntimeException("Update data error:"+strError);
        }
        return rows;

    }
    public Map<String,Object> getDataConfigMap(String dataType){

        String sql = "select * from data where tablename=? ";
        List list = jdbcTemplate.queryForList(sql, new Object[]{dataType});
        if(list.size()>0)
        {
            Map<String,Object> mp= (Map)list.get(0);
            return mp;
        }
        return null;
    }
    public List getDataConfig(String dataType){

        String sql = "select * from data where tablename=? ";
        List list = jdbcTemplate.queryForList(sql, new Object[]{dataType});
        return list;
    }
    public List getDataFileds(String tableName){

        String sql = "select * from data_fields where tablename=? and isinfile='0' order by showsort";
        List list = jdbcTemplate.queryForList(sql, new Object[]{tableName});
        return list;
    }
    public int createTable(String sql){

        int rows = jdbcTemplate.update(sql);
        return rows;
    }
    public int dropTable(String sql){

        int rows = jdbcTemplate.update(sql);
        return rows;
    }
}
