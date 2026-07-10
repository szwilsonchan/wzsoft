    const MenuVue[@configid@] = 
    {
        data() 
        {
            return {
	            curLocation:"",
                menumode:"[@menumode@]",
                apptype:"[@apptype@]",
                topmenu:[],
                showpid:{},
                datas:null
            }
        },
        methods: 
        {
            getDatas() 
            {
                let paras = {};
                if(this.menumode=='1')
                {
                    if(sessionStorage)
                    {
                        let s = sessionStorage.getItem("menulist");
                        if(s)
                        {
                            let mo = JSON.parse(s);
                            paras['mrole'] = mo['mrole'];
                            paras['mdate'] = mo['mdate'];
                        }
                    }

                    paras['apptype']=this.apptype;
                    var that = this;
                    axios.post("./../apimenu/getlist",paras).then(function(res){

                    let redata = res.data;
                    if(redata[0])
                    {
                        that.datas=redata[0];
                        let mo = redata[1];
                        mo['mlist'] = that.datas;
                        if(sessionStorage)
                        {
                            sessionStorage.setItem("menulist",JSON.stringify(mo));
                        }
                    }
                    else
                    {
                        if(sessionStorage)
                        {
                            let s = sessionStorage.getItem("menulist");
                            if(s)
                            {
                                let mo = JSON.parse(s);
                                that.datas = mo['mlist'];
                            }
                        }
                    }

                    let pid = null;
                    let menu = null ;
                    for(let item of that.datas)
                    {
                        if(item["PID"]==null)
                        {
                            pid = item["APPID"];
                            if(menu!=null)
                                that.topmenu.push(menu);

                            menu={};
                            menu['APPID'] = item["APPID"];
                            menu['PID'] = item["PID"];
                            menu['NAME'] = item["NAME"];
                            menu['LOCATION'] = item["LOCATION"];
                            menu['IMG'] = item["IMG"];
                            menu['IMGSEL'] = item["IMGSEL"];
                            menu['CHILDS'] = [];
                            menu['SHOW'] = false;
                        }
                        else if(item["PID"]!=null&&item["PID"]==pid)
                        {
                            menu['CHILDS'].push(item);
                        }

                        if(item["PID"]==null)
                            that.showpid['S'+item["APPID"]] = false;
                    }
                    if(menu!=null)
                        that.topmenu.push(menu);

                    that.getMenuSession();
                    }).catch(function (err) {
                    });
                }
                else if(this.menumode=='2')
                {
                    paras['curPage']=1;
                    paras['pageItmes']=100;
                    paras['apptype']=this.apptype;
                    paras['order_snum#asc,snumsub#asc']='';
                    var that = this;
                    axios.post("./../portal/apimenu/getlist",paras).then(function(res){
                    that.datas=res.data;
                    
                    let pid = null;
                    let menu = null ;
                    for(let item of that.datas)
                    {
                        if(item["PID"]==null)
                        {
                            pid = item["APPID"];
                            if(menu!=null)
                                that.topmenu.push(menu);

                            menu={};
                            menu['APPID'] = item["APPID"];
                            menu['PID'] = item["PID"];
                            menu['NAME'] = item["NAME"];
                            menu['LOCATION'] = item["LOCATION"];
                            menu['IMG'] = item["IMG"];
                            menu['IMGSEL'] = item["IMGSEL"];
                            menu['CHILDS'] = [];
                            menu['SHOW'] = false;
                        }
                        else if(item["PID"]!=null&&item["PID"]==pid)
                        {
                            menu['CHILDS'].push(item);
                        }
                        if(item["PID"]==null)
                            that.showpid['S'+item["APPID"]] = false;
                    }
                    if(menu!=null)
                        that.topmenu.push(menu);

                    that.getMenuSession();

                    }).catch(function (err) {
                    });
                }
            },
            onImgOver(s,e) 
            {
                let p = e.target;
                if(s&&s!="")
                {
                    p.src='./../upload/' +s;
                }
            },            
            onImgOut(s,e) 
            {
                let p = e.target;
                if(s&&s!="")
                {
                    p.src='./../upload/' +s;
                }
            },
            setMenuSession(lc) 
            {
                if(lc==null||lc=="")
                {
                    return;
                }

                let paras = {};
                var that = this;
                axios.post("./../portal/apimenu/getcur?currentLocation="+lc,paras).then(function(res){
                window.location.href=lc;

                }).catch(function (err) {
                });
            },
            getMenuSession() 
            {
                let paras = {};
                var that = this;
                axios.post("./../portal/apimenu/getcur",paras).then(function(res){
                if(res.data!=null)
                {
                    that.curLocation = res.data;

                    for(let item of that.datas)
                    {
                        if(item["LOCATION"]==that.curLocation&&that.curLocation!=null)
                        {
                            that.showpid['S'+item["PID"]] = true;
                            break;
                        }
                    }
                }

                }).catch(function (err) {
                });
            }
        },
        mounted() 
        {
            this.getDatas();
        }
    }
    
    Vue.createApp(MenuVue[@configid@]).mount('#menu-content[@configid@]');
    