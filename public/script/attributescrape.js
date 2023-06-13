async function pickAll() {
    const iframe = document.getElementById("iframeModel")
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
    iframeDoc.getElementsByClassName("xeokit-i18n explorer_toggle_label xeokit-btn fas fa-2x fa-sitemap")[0].click()
    const myExplorer = iframeDoc.getElementById("myExplorer")
    await Sleep(100)

    const queryClassDesign = myExplorer.querySelectorAll(".xeokit-classes.xeokit-tree-panel > ul > li > ul > li")
    let scrape = []
    for (let child of queryClassDesign){
        const ifcButton = child.querySelector("a")
        if (ifcButton.classList.contains("plus")){
            ifcButton.click()
        }
        await Sleep(100)
        const ifcSpanName = child.querySelector("span")
        if (ifcSpanName.innerText == "IfcDoor" || ifcSpanName.innerText == "IfcWindow"){
            continue
        } 
        const ifcComponent = child.lastChild.querySelectorAll("li span")
        for (const ifcComponentChild of ifcComponent){
            ifcComponentChild.dispatchEvent(new MouseEvent("contextmenu"))
            iframeDoc.getElementsByClassName("xeokit-context-menu ContextMenu_50")[0].firstChild.firstChild.click()
            const myInspector = iframeDoc.getElementById("myInspector")
            const queryInspector = myInspector.querySelectorAll(".xeokit-accordion .xeokit-accordion-container")
            let childScrape = {}
            for (const xeokitAccordionContainer of queryInspector){
                const xeokitAccordionButton = xeokitAccordionContainer.getElementsByClassName("xeokit-accordion-button")[0]
                const xeokitAccordionPanel = xeokitAccordionContainer.getElementsByClassName("xeokit-accordion-panel")[0]
                const innerText = xeokitAccordionButton.innerText
                if (innerText != "Dimensions" && innerText != "Other"){
                    continue
                }
                xeokitAccordionButton.click()
                const trs = xeokitAccordionPanel.querySelectorAll("tr")
                for (const tr of trs){
                    if (tr.children[0].innerText == "Area:") {
                        childScrape["Area"] = tr.children[1].innerText
                    }
                    if (tr.children[0].innerText == "Category:") {
                        childScrape["Category"] = tr.children[1].innerText
                    }
                    if (tr.children[0].innerText == "Type:") {
                        childScrape["Type"] = tr.children[1].innerText
                    }
                }
            }
            scrape.push(childScrape)
        //}
        }
    }
    iframeDoc.getElementsByClassName("xeokit-i18n explorer_toggle_label xeokit-btn fas fa-2x fa-sitemap")[0].click()
    iframeDoc.getElementsByClassName("xeokit-i18n inspector_toggle_label xeokit-btn fas fa-info-circle fa-2x")[0].click()
    return scrape
}



function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const buttonPickAll = document.getElementById("pickAll")
buttonPickAll.addEventListener("click", async () => {
    const scrape = await pickAll()
    const url = window.location.pathname.split("/").at(-1)
    let http = new XMLHttpRequest()
    http.open('POST', `http://127.0.0.1:8080/addattribute/${url}`, true);
    http.setRequestHeader("Content-Type", "application/json")
    http.send(JSON.stringify(scrape));
    http.onreadystatechange = () => {
        if (http.readyState === 4) {
            window.location.href = `http://127.0.0.1:8080/attributelistdata/${url}`
        }
    }
})