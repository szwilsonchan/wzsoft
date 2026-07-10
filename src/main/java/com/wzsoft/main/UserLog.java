package com.wzsoft.main;


public class UserLog{

    public String mname;
    public long evtime=0;
    public long evnum=0;
    public long mtime;
    public String mdate;
    public String toString(){
        return mname + "|" + String.valueOf(evtime) + "|"  + String.valueOf(evnum) + "|" + String.valueOf(mtime) + "|" + mdate;
    }
}