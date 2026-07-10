const MenuVue= 
{
    data() 
    {
        return {
            curLocation:"",
            showpid:{},
            datas:null
        }
    },
    methods: 
    {
        getDatas() 
        {
            let paras = {};
            paras['viewCode']="menu";
            paras['curPage']=1;
            paras['pageItmes']=100;
            paras['order_snum#asc,snumsub#asc']='';
            var that = this;
            axios.post("./../api/datalist",paras).then(function(res){
            that.datas=Object.values(res.data)[0];  

            for(let item of that.datas)
            {
                if(item["PID"]==null)
                    that.showpid['S'+item["MENUID"]] = false;
            }

            that.getMenuSession();

            }).catch(function (err) {
            });
        },
        setMenuSession(pid,lc) 
        {
            if(pid!=null&&lc==null)
            {
                if(this.showpid['S'+pid])
                    this.showpid['S'+pid]=false;
                else
                    this.showpid['S'+pid]=true;
            }
            else
            {
                let paras = {};
                axios.post("./../apimenu/getcur?currentLocation="+lc,paras).then(function(res){
                
                let s = sessionStorage.getItem("admin"+lc.replace(".html",""));
                if(s)
                {
                    sessionStorage.removeItem("admin"+lc.replace(".html",""),null);
                }
                
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
    }
}

Vue.createApp(MenuVue).mount('#menu-content');