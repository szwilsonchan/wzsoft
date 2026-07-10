
function gfileDownload(fileID,fileName)
{
    axios({
        url: './../portal/api/downloadFile',
        method: 'POST',
        data:{"fileGuid":fileID},
        responseType: 'blob', 
        }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        });
}