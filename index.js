document.addEventListener('DOMContentLoaded', () => {
    logStatus("Welcome! Use the controls to manipulate a linked list.", "welcome", 6000);
    const datainput = document.getElementById("nodeInput");
    const elementinput = document.getElementById("dataInput");
    const posinput = document.getElementById("posInput");

    const insertStartBtn = document.getElementById("insertStartBtn");
    const insertEndBtn = document.getElementById("insertEndBtn");
    const insertBeforeBtn = document.getElementById("insertBefore");
    const insertAfterBtn = document.getElementById("insertAfter");
    const insertAtBtn = document.getElementById("insertAtBtn");

    const deleteStartBtn = document.getElementById("deleteStartBtn");
    const deleteEndBtn = document.getElementById("deleteEndBtn");
    const deleteBeforeBtn = document.getElementById("deleteBeforeBtn");
    const deleteAfterBtn = document.getElementById("deleteAfterBtn");
    const deleteAtBtn = document.getElementById("deleteAtBtn");

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    const toggleCircularBtn = document.getElementById("makeCircularBtn");
    const clearCanvasBtn = document.getElementById("clear-canvas");

    const toggleControlsBtn = document.getElementById("control-toggle");
    const controlWrapper = document.getElementById("control-wrapper");

    const toggleSidebarBtn = document.getElementById("sidebar-toggle");
    const sidebarWrapper = document.getElementById("sidebar-wrapper");

    const dynamicPanelWrapper = document.getElementById("dynamic-panel-wrapper");
    const dynamicPanelHeading = document.getElementById("dynamic-panel-heading");
    const dynamicPanelContent = document.getElementById("dynamic-panel-content");
    const dynamicPanelClose = document.getElementById("dynamic-panel-close");

    fetch("linearlinkedfuncs.json")
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('#sidebar-panel fieldset:nth-of-type(2) button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const funcName = btn.id;
                    const code = data[funcName];
                    dynamicPanelHeading.textContent = btn.textContent.trim();
                    const codeEl = document.getElementById("codeContainer");
                    if (codeEl) codeEl.textContent = code;
                    dynamicPanelWrapper.classList.toggle("hidden");
                });
            });
        })
        .catch(err => console.error("Error loading JSON:", err));

    fetch("circularlinkedfuncs.json")
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('#sidebar-panel fieldset:nth-of-type(3) button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const funcName = btn.id;
                    const code = data[funcName];
                    dynamicPanelHeading.textContent = btn.textContent.trim();
                    const codeEl = document.getElementById("codeContainer");
                    if (codeEl) codeEl.textContent = code;
                    dynamicPanelWrapper.classList.toggle("hidden");
                });
            });
        })
        .catch(err => console.error("Error loading circular JSON:", err));

    fetch("misclinkedfuncs.json")
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('#sidebar-panel fieldset:nth-of-type(1) button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const funcName = btn.id;
                    const code = data[funcName];
                    dynamicPanelHeading.textContent = btn.textContent.trim();
                    const codeEl = document.getElementById("codeContainer");
                    if (codeEl) codeEl.textContent = code;
                    dynamicPanelWrapper.classList.toggle("hidden");
                });
            });
        })
        .catch(err => console.error("Error loading Misc JSON:", err));

    let nodes = [];
    let links = [];
    let nextId = 0;
    let isCircular = false;

    const svg = d3.select("svg");
    const g = svg.append("g");

    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "yellowgreen");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));

    function updateGraph() {
        let linkSel = g.selectAll(".link").data(links);
        let nodeSel = g.selectAll(".node").data(nodes, d => d.id);

        linkSel.exit().remove();
        nodeSel.exit().remove();

        const nodeEnter = nodeSel.enter()
            .append("g")
            .attr("class", "node")
            .call(
                d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );

        nodeEnter.append("rect")
            .attr("class", "outer")
            .attr("width", d => Math.max(60, d.text.length * 8) + 20)
            .attr("height", 80);

        nodeEnter.append("rect")
            .attr("class", "data-cell")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", d => Math.max(60, d.text.length * 8))
            .attr("height", 30);

        nodeEnter.append("text")
            .attr("class", "data-text")
            .attr("x", d => 10 + Math.max(60, d.text.length * 8) / 2)
            .attr("y", 25)
            .text(d => d.text);

        const gap = 30;

        nodeEnter.append("circle")
            .attr("cx", d => 10 + Math.max(60, d.text.length * 8) / 2 + 15)
            .attr("r", 5);

        nodeSel = nodeEnter.merge(nodeSel);

        linkSel = linkSel.enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)")
            .merge(linkSel);

        simulation.nodes(nodes).on("tick", ticked);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();

        function ticked() {
            const gap = 30;
            const circleY = 58;
            const circleX = d => 10 + Math.max(60, d.text.length * 8) / 2;

            g.selectAll(".link")
                .attr("x1", d => d.source.x + circleX(d.source) + gap / 2)
                .attr("y1", d => d.source.y + circleY)
                .attr("x2", d => d.target.x + circleX(d.target) - gap / 2)
                .attr("y2", d => d.target.y + circleY);

            g.selectAll(".node")
                .attr("transform", d => `translate(${d.x},${d.y})`);

            g.selectAll(".start-pointer").remove();
            g.selectAll(".end-pointer").remove();

            if (nodes.length > 0) {
                const startNode = nodes[0];
                const endNode = nodes[nodes.length - 1];
                const leftCircleX = circleX(startNode) - gap / 2;
                const rightCircleX = circleX(endNode) - gap / 2;

                g.append("line")
                    .attr("class", "start-pointer")
                    .attr("x1", startNode.x + leftCircleX)
                    .attr("y1", startNode.y + circleY + 50)
                    .attr("x2", startNode.x + leftCircleX)
                    .attr("y2", startNode.y + circleY)
                    .attr("stroke", "#eaeaea")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrow)");

                g.append("text")
                    .attr("class", "start-pointer")
                    .attr("x", startNode.x + leftCircleX)
                    .attr("y", startNode.y + circleY + 60)
                    .attr("fill", "#eaeaea")
                    .attr("text-anchor", "middle")
                    .text("Start");

                g.append("line")
                    .attr("class", "end-pointer")
                    .attr("x1", endNode.x + rightCircleX)
                    .attr("y1", endNode.y + circleY + 50)
                    .attr("x2", endNode.x + rightCircleX)
                    .attr("y2", endNode.y + circleY)
                    .attr("stroke", "#eaeaea")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrow)");

                g.append("text")
                    .attr("class", "end-pointer")
                    .attr("x", endNode.x + rightCircleX)
                    .attr("y", endNode.y + circleY + 60)
                    .attr("fill", "#eaeaea")
                    .attr("text-anchor", "middle")
                    .text("End");

            }
        }
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    const zoom = d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => {
        g.attr("transform", event.transform);
    });
    svg.call(zoom);

    function updateNodePositions() {
        const startX = window.innerWidth / 3;
        const y = window.innerHeight / 2;
        const gap = 150;
        nodes.forEach((d, i) => {
            if (!d.fx) d.x = startX + i * gap;
            if (!d.fy) d.y = y;
        });
    }

    function updateNodeCount() {
        const countFeed = document.getElementById("node-count-feed");
        const countSpan = document.getElementById("nodeCount");
        if (nodes.length === 0) countFeed.style.display = "none";
        else { countFeed.style.display = "block"; countSpan.textContent = nodes.length; }
    }

    function clearCanvas() {
        nodes = [];
        links = [];
        nextId = 0;
        g.selectAll("*").remove();
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        updateNodeCount();
        simulation.alpha(1).restart();
        document.getElementById("nodeCount").textContent = 0;
        logStatus("Canvas cleared", "info");
    }

    function openDynamicPanel(title, htmlContent = "") {
        dynamicPanelHeading.textContent = title;
        dynamicPanelContent.innerHTML = htmlContent;
        dynamicPanelWrapper.classList.add("active");
    }

    function closeDynamicPanel() {
        dynamicPanelWrapper.classList.remove("active");
    }

    function toggleCircular() {
        isCircular = !isCircular;
        toggleCircularBtn.textContent = isCircular ? "Make Linear" : "Make Circular";
        rebuildLinks();
        logStatus(`List is now ${isCircular ? "Circular" : "Linear"}`, "info");
    }

    function logStatus(msg, type = "info", timeout = 4000) {
        const feed = document.getElementById("status-feed");
        const entry = document.createElement("div");
        entry.classList.add("status-msg");

        if (type === "error") entry.classList.add("status-error");
        if (type === "success") entry.classList.add("status-success");
        if (type === "info") entry.classList.add("status-info");
        if (type === "welcome") entry.classList.add("status-welcome");

        entry.textContent = `${msg}`;
        feed.appendChild(entry);
        feed.scrollTop = feed.scrollHeight; // auto scroll

        setTimeout(() => {
            entry.classList.add("fade-out");
            setTimeout(() => entry.remove(), 500); // match CSS transition
        }, timeout);
    }

    function rebuildLinks() {
        links = [];
        for (let i = 0; i < nodes.length - 1; i++) links.push({ source: nodes[i], target: nodes[i + 1] });
        if (isCircular && nodes.length > 1) links.push({ source: nodes[nodes.length - 1], target: nodes[0] });
        updateNodePositions();
        updateNodeCount();
        updateGraph();
    }

    function insertNodeEnd() {
        const data = datainput.value.trim();
        if (!data) return logStatus("Please enter a value to insert", "error");
        nodes.push({ id: nextId++, text: data });
        rebuildLinks();
        logStatus(`Node "${data}" added at the end`, "success");
        datainput.value = "";
    }

    function insertNodeStart() {
        const data = datainput.value.trim();
        if (!data) return logStatus("Please enter a value to insert", "error");
        nodes.unshift({ id: nextId++, text: data });
        rebuildLinks();
        logStatus(`Node "${data}" added at the start`, "success");
        datainput.value = "";
    }

    function insertBeforeNode() {
        const data = datainput.value.trim();
        const ref = elementinput.value.trim();
        if (!data || !ref) return logStatus("Both node value and reference element required", "error");
        const index = nodes.findIndex(n => n.text === ref);
        if (index === -1) return logStatus(`Reference node "${ref}" not found`, "error");
        nodes.splice(index, 0, { id: nextId++, text: data });
        rebuildLinks();
        logStatus(`Node "${data}" inserted before "${ref}"`, "success");
        datainput.value = elementinput.value = "";
    }

    function insertAfterNode() {
        const data = datainput.value.trim();
        const ref = elementinput.value.trim();
        if (!data || !ref) return logStatus("Both node value and reference element required", "error");
        const index = nodes.findIndex(n => n.text === ref);
        if (index === -1) return logStatus(`Reference node "${ref}" not found`, "error");
        nodes.splice(index + 1, 0, { id: nextId++, text: data });
        rebuildLinks();
        logStatus(`Node "${data}" inserted after "${ref}"`, "success");
        datainput.value = elementinput.value = "";
    }

    function insertAt() {
        const data = datainput.value.trim();
        const pos = parseInt(posinput.value.trim(), 10);
        if (!data || isNaN(pos)) return logStatus("Both node value and valid position required", "error");
        if (pos < 1 || pos > nodes.length + 1) return logStatus("Position out of range", "error");
        nodes.splice(pos - 1, 0, { id: nextId++, text: data });
        rebuildLinks();
        logStatus(`Node "${data}" inserted at position ${pos}`, "success");
        datainput.value = posinput.value = "";
    }

    function deleteNodeStart() {
        if (!nodes.length) return logStatus("List is empty", "error");
        const removed = nodes.shift();
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted from start`, "success");
    }

    function deleteNodeEnd() {
        if (!nodes.length) return logStatus("List is empty", "error");
        const removed = nodes.pop();
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted from end`, "success");
    }

    function deleteBeforeNode() {
        const ref = elementinput.value.trim();
        if (!ref) return logStatus("Reference element required", "error");
        const index = nodes.findIndex(n => n.text === ref);
        if (index <= 0) return logStatus("No node exists before this reference", "error");
        const removed = nodes.splice(index - 1, 1)[0];
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted before "${ref}"`, "success");
        elementinput.value = "";
    }

    function deleteAfterNode() {
        const ref = elementinput.value.trim();
        if (!ref) return logStatus("Reference element required", "error");
        const index = nodes.findIndex(n => n.text === ref);
        if (index === -1 || index === nodes.length - 1) return logStatus("No node exists after this reference", "error");
        const removed = nodes.splice(index + 1, 1)[0];
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted after "${ref}"`, "success");
        elementinput.value = "";
    }

    function deleteAt() {
        const pos = parseInt(posinput.value.trim(), 10);
        if (isNaN(pos)) return logStatus("Valid position required", "error");
        if (pos < 1 || pos > nodes.length) return logStatus("Position out of range", "error");
        const removed = nodes.splice(pos - 1, 1)[0];
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted at position ${pos}`, "success");
        posinput.value = "";
    }

    const performSearch = () => {
        const value = searchInput.value.trim();
        if (!value) {
            logStatus("Cannot search for an empty value", "error");
            return;
        }
        g.selectAll(".node").classed("highlight", false);
        g.selectAll(".highlight-marker").remove();
        const matchingNodes = nodes.filter(n => n.text === value);

        if (matchingNodes.length > 0) {
            matchingNodes.forEach(node => {
                g.selectAll(".node").filter(d => d.id === node.id).classed("highlight", true);
                const index = nodes.indexOf(node);
                const dataCellWidth = Math.max(60, node.text.length * 8);
                const circleX = 10 + dataCellWidth + 15;

                g.append("text")
                    .attr("class", "highlight-marker")
                    .attr("x", node.x + circleX)
                    .attr("y", node.y - 10)
                    .attr("text-anchor", "middle")
                    .attr("fill", "rgb(255, 255, 143)")
                    .attr("font-weight", "bold")
                    .style("opacity", 1)
                    .text(`Index: ${index + 1}`)
                    .transition()
                    .duration(2000)
                    .remove();
            });

            g.selectAll(".node.highlight").selectAll("rect, circle")
                .transition().duration(400).style("opacity", 0.3)
                .transition().duration(400).style("opacity", 1)
                .transition().duration(400).style("opacity", 0.3)
                .transition().duration(400).style("opacity", 1)
                .on("end", function () { d3.select(this.parentNode).classed("highlight", false); });

            logStatus(`Found ${matchingNodes.length} ${matchingNodes.length === 1 ? "instance" : "instances"} of "${value}"`, "success");
        } else {
            logStatus(`"${value}" not present`, "error");
        }
        searchInput.value = "";
    };

    function toggleControls() {
        controlWrapper.classList.toggle("hidden");
        if (controlWrapper.classList.contains("hidden")) {
            toggleControlsBtn.classList.toggle("top");
            toggleControlsBtn.textContent = "↑ Show Controls";
        } else {
            toggleControlsBtn.classList.toggle("top");
            toggleControlsBtn.textContent = "↓ Hide Controls";
        }
    }

    function toggleSidebar() {
    sidebarWrapper.classList.toggle("hidden");

    if (sidebarWrapper.classList.contains("hidden")) {
        toggleSidebarBtn.classList.toggle("left");
        toggleSidebarBtn.textContent = "☰ Show code";
        dynamicPanelWrapper.classList.add("hidden");
    } else {
        toggleSidebarBtn.classList.toggle("left");
        toggleSidebarBtn.textContent = "☰ Hide Code";
    }
}


    insertStartBtn.addEventListener("click", insertNodeStart);
    insertEndBtn.addEventListener("click", insertNodeEnd);
    insertBeforeBtn.addEventListener("click", insertBeforeNode);
    insertAfterBtn.addEventListener("click", insertAfterNode);
    insertAtBtn.addEventListener("click", insertAt);

    deleteStartBtn.addEventListener("click", deleteNodeStart);
    deleteEndBtn.addEventListener("click", deleteNodeEnd);
    deleteBeforeBtn.addEventListener("click", deleteBeforeNode);
    deleteAfterBtn.addEventListener("click", deleteAfterNode);
    deleteAtBtn.addEventListener("click", deleteAt);

    toggleCircularBtn.addEventListener("click", toggleCircular);
    clearCanvasBtn.addEventListener("click", clearCanvas);
    searchBtn.addEventListener("click", performSearch);

    toggleControlsBtn.addEventListener("click", toggleControls);
    toggleSidebarBtn.addEventListener("click", toggleSidebar);

    datainput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") { event.preventDefault(); insertNodeEnd(); }
    });

    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") { event.preventDefault(); performSearch(); }
    });

    dynamicPanelClose.addEventListener("click", () => {
        dynamicPanelWrapper.classList.add("hidden");
    });
});