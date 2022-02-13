var elInputfile = document.getElementById('inputfile');

var reader = new XMLHttpRequest();
reader.open('get', m3uConfig.inputPath, true);
reader.onreadystatechange = function () {

    if (reader.readyState === 4) {

        // IMPRIME GRUPOS POR CONSOLA
        var setGroupTitle = new Set()
        /**
         * @type{string}
         */
        let stringResponse = this.response;
        let arrayResponse  = stringResponse.split('\r\n');
        var regGroupTitle  = new RegExp('(?<=group-title=\")(.*?)(?=\")')
        var regTvgName   = new RegExp('(?<=tvg-name=\")(.*?)(?=\")')
        arrayResponse.forEach((v) => {
            // ejecuta REGEX
            let regArrayGroupTitle = regGroupTitle.exec(v);
            if (regArrayGroupTitle) {
                regArrayGroupTitle.forEach((g) => { setGroupTitle.add(g) });
            };
        })
        console.log('******Todos los grupos******')
        setGroupTitle.forEach(v => console.log(v))


        // FILTRA GRUPOS de 'filterGroups'
        var filteredResult = [];
        var filteredResultXspf = [];
        var  stringXspf = ``;
        var appendNextLine = false;
        var setFilteredGroups = new Set();

        arrayResponse.forEach(r => {
            if (appendNextLine === false) {
                stringXspf = ``;
                let regArrayGroupTitle = regGroupTitle.exec(r);
                let regArrayTvgName  = regTvgName.exec(r);
                if (regArrayGroupTitle) {
                    if (m3uConfig.filterGroups.includes(regArrayGroupTitle[0])) {
                        filteredResult.push(r);
                        appendNextLine = true;
                        setFilteredGroups.add(regArrayGroupTitle[0]);
                        stringXspf = `<track><title>${regArrayTvgName[0]}</title><creator>${regArrayGroupTitle[0]}</creator>`;
                    };
                }
            } else {
                filteredResult.push(r);
                
                stringXspf = `${stringXspf}<location>${r}</location></track>`;
                
                let stringXspfSinAmpersand = stringXspf.replace('\&','')
                filteredResultXspf.push(stringXspfSinAmpersand);

                appendNextLine = false;
            };
        });
        
        console.log('******grupos filtrados******')
        console.log('******grupos filtrados******')
        setFilteredGroups.forEach(v => console.log(v))

        // CONVIERTE A .XSPF
        const stringXspfInic = `<?xml version="1.0" encoding="UTF-8"?><playlist xmlns="http://xspf.org/ns/0/" xmlns:vlc="http://www.videolan.org/vlc/playlist/ns/0/" version="1"><trackList>`;
        const stringXspfFin = `</trackList></playlist>`

        // DESCARGA BLOB M3U
        if (filteredResult.length !== 0) {
            filteredResult.unshift('#EXTM3U');
            let filteredResultString = filteredResult.join('\r\n');
            const blobFilteredResult =  new Blob([filteredResultString]);
            let blobUrl = URL.createObjectURL(blobFilteredResult);
            let link = document.createElement("a"); 
            link.href = blobUrl;
            link.download = `${m3uConfig.outputName}.m3u`;
            link.innerHTML = ".M3U";
            document.body.appendChild(link); 

            let newLine = document.createElement("br"); 
            document.body.appendChild(newLine); 
        }

        // DESCARGA BLOB XSPF
        if (filteredResultXspf.length !== 0) {
            
            let filteredResultXspfString = `${stringXspfInic}${filteredResultXspf.join('')}${stringXspfFin}`;
            const blobFilteredXspfResult =  new Blob([filteredResultXspfString]);
            let blobXspfUrl = URL.createObjectURL(blobFilteredXspfResult);
            let linkXspf = document.createElement("a"); 
            linkXspf.href = blobXspfUrl;
            linkXspf.download = `${m3uConfig.outputName}.xspf`;
            linkXspf.innerHTML = ".XSPF";
            document.body.appendChild(linkXspf); 
        }

    }
};
reader.send(null);
