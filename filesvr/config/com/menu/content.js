    const MenuVue[@configid@] = 
    {
        data() 
        {
            return {
	            curLocation:"",
                menumode:"[@menumode@]",
                apptype:"[@apptype@]",
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

                    for(let item of that.datas)
                    {
                        if(item["PID"]==null)
                            that.showpid['S'+item["APPID"]] = false;
                    }

                    that.getMenuSession();
                    document.getElementById("menu-content[@configid@]").style.display="block";

                    }).catch(function (err) {
                    });
                }
                else if(this.menumode=='2')
                {
                    paras['curPage']=1;
                    paras['pageItmes']=500;
                    paras['apptype']=this.apptype;
                    paras['order_snum#asc,snumsub#asc']='';
                    var that = this;
                    axios.post("./../portal/apimenu/getlist",paras).then(function(res){
                    that.datas=redata[0];

                    for(let item of that.datas)
                    {
                        if(item["PID"]==null)
                            that.showpid['S'+item["APPID"]] = false;
                    }

                    that.getMenuSession();
                    document.getElementById("menu-content[@configid@]").style.display="block";

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
            setMenuSession(pid,lc) 
            {
                if(pid!=null&&(lc==null||lc==''))
                {
                    if(this.showpid['S'+pid])
                        this.showpid['S'+pid]=false;
                    else
                        this.showpid['S'+pid]=true;
                }
                else
                {
                    let paras = {};
                    var that = this;
                    axios.post("./../apimenu/getcur?currentLocation="+lc,paras).then(function(res){
                    window.location.href=lc;
                    }).catch(function (err) {
                    });
                }
            },
            getMenuSession() 
            {
                let paras = {};
                var that = this;
                axios.post("./../apimenu/getcur",paras).then(function(res){
	            that.curLocation = res.data;
                for(let item of that.datas)
                {
                    if(item["LOCATION"]==that.curLocation&&that.curLocation!=null)
                    {
                        that.showpid['S'+item["PID"]] = true;
                        break;
                    }
                }
                }).catch(function (err) {
                });
            }
        },
        mounted() 
        {
            this.getDatas();
	        this.getMenuSession();
        }
    }
    
    Vue.createApp(MenuVue[@configid@]).mount('#menu-content[@configid@]');
    