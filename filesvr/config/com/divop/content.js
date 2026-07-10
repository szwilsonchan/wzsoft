function setDataItem[@configid@](k,v)
{
    let dguid="[@divguid@]";
    let p=document.getElementById("divop"+dguid);

    if(v.toString()=="true")
    {
        p.style.display="";
    }
    else if(v.toString()=="false")
    {
        p.style.display="none";
    }
    else
    {
        if(v.substring(0,1)=="f")
        {
            let s = v.substring(1,v.length);
            let arr = s.split(",");
            for(let i=0;i<arr.length;i++)
            {
                let vi = arr[i]; 
                let si=1;
                let pc = document.getElementById("divopcon"+dguid);
                for(let dNode of pc.childNodes)
                {
                    if(si.toString()==vi)
                    {
                        dNode.style.display="none";
                        dNode.name="hidden";
                    }
                    else
                    {
                        dNode.style.display="block";
                        dNode.name=""; 
                    }
                    si=si+1;
                }
            
                si=1;
                let pp = document.getElementById("divoptitle"+dguid);
                for(let dNode of pp.childNodes)
                {
                    if(si.toString()==vi)
                    {
                        dNode.style.display="none";
                        dNode.name="hidden";
                    }
                    else
                    {
                        dNode.style.display="block";
                        dNode.name="";  
                    }
                    si=si+1;
                }
            }
        }
    }
}