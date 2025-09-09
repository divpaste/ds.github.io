document.addEventListener('DOMContentLoaded', () => {
    logStatus("Welcome! Use the controls to manipulate a linked list.", "info", 6000);
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
    const deleteValueBtn = document.getElementById("deleteValueBtn");

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    const toggleCircularBtn = document.getElementById("makeCircularBtn");
    const toggleDoublyBtn = document.getElementById("makeDoublyBtn");
    const clearCanvasBtn = document.getElementById("clear-canvas");
    const toggleBlindModeBtn = document.getElementById("toggleBlindModeBtn");

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
    let isDoubly = false;
    let isBlindMode = false;

    const svg = d3.select("svg");
    const g = svg.append("g");
    const defs = svg.append("defs");

    defs.append("marker")
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
        .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))

    updateListType();

    function updateGraph() {
        let nodeSel = g.selectAll(".node").data(nodes, d => d.id);
        let linkSel = g.selectAll(".link").data(links);

        g.selectAll(".node").classed("highlight", false).style("opacity", d => { if (!isBlindMode) return 1; return (d === nodes[0] || d === nodes[nodes.length - 1]) ? 1 : 0; });
        g.selectAll(".link, .backward-link").style("opacity", d => (isBlindMode ? 0 : 1));

        nodeSel.exit().remove();
        linkSel.exit().remove();

        const nodeEnter = nodeSel.enter()
            .append("g")
            .attr("class", "node")
            .style("opacity", d => {
                if (!isBlindMode) return 1;
                return (d === nodes[0] || d === nodes[nodes.length - 1]) ? 1 : 0;
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );

        nodeEnter.append("rect")
            .attr("class", "outer")
            .attr("width", d => Math.max(60, d.text.length * 8) + 20)
            .attr("height", d => isDoubly ? 100 : 80);

        nodeEnter.append("rect")
            .attr("class", "data-cell")
            .attr("x", 10)
            .attr("y", isDoubly ? 35 : 10)
            .attr("width", d => Math.max(60, d.text.length * 8))
            .attr("height", 30);

        nodeEnter.append("text")
            .attr("class", "data-text")
            .attr("x", d => 10 + Math.max(60, d.text.length * 8) / 2)
            .attr("y", isDoubly ? 50 : 25)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => d.text);

        const circleRadius = 5;
        if (isDoubly) {
            nodeEnter.append("circle")
                .attr("class", "top-left-circle")
                .attr("cx", d => 10 + Math.max(60, d.text.length * 8) / 2 - 15)
                .attr("cy", 20)
                .attr("r", circleRadius)
                .attr("fill", "#ff4d4d");
        }
        nodeEnter.append("circle")
            .attr("class", "bottom-right-circle")
            .attr("cx", d => 10 + Math.max(60, d.text.length * 8) / 2 + 15)
            .attr("cy", isDoubly ? 80 : 58)
            .attr("r", circleRadius)
            .attr("fill", "#ff4d4d");

        nodeSel = nodeEnter.merge(nodeSel);

        nodeSel.select("rect.outer")
            .transition()
            .duration(100)
            .attr("height", d => isDoubly ? 100 : 80);

        nodeSel.select("rect.data-cell")
            .transition()
            .duration(100)
            .attr("y", isDoubly ? 35 : 10)
            .attr("width", d => Math.max(60, d.text.length * 8));

        nodeSel.select("text.data-text")
            .transition()
            .duration(100)
            .attr("y", isDoubly ? 50 : 25)
            .attr("x", d => 10 + Math.max(60, d.text.length * 8) / 2);

        nodeSel.select("circle.bottom-right-circle")
            .transition()
            .duration(100)
            .attr("cx", d => 10 + Math.max(60, d.text.length * 8) / 2 + 15)
            .attr("cy", d => isDoubly ? 80 : 58);

        nodeSel.each(function (d) {
            const gNode = d3.select(this);
            let circle = gNode.select("circle.top-left-circle");
            if (isDoubly) {
                if (circle.empty()) {
                    gNode.append("circle")
                        .attr("class", "top-left-circle")
                        .attr("cx", 10 + Math.max(60, d.text.length * 8) / 2 - 15)
                        .attr("cy", 20)
                        .attr("r", circleRadius)
                        .attr("fill", "#ff4d4d");
                }
            } else {
                if (!circle.empty()) circle.remove();
            }
        });

        nodeSel
            .on("mouseover", function (event, d) {
                if (d.dragging) return;
                d.hovered = true;

                if (isBlindMode) {
                    // --- Blind mode reveal ---
                    d3.select(this).transition().duration(100).style("opacity", 1);

                    // Reveal connected forward nodes
                    g.selectAll(".node").filter(n =>
                        links.some(l => l.source.id === d.id && l.target.id === n.id)
                    ).transition().duration(100).style("opacity", 1);

                    // Reveal connected backward nodes
                    g.selectAll(".node").filter(n =>
                        links.some(l => l.backward && l.source.id === d.id && l.target.id === n.id)
                    ).transition().duration(100).style("opacity", 1);

                    // Reveal outgoing links
                    g.selectAll(".link, .backward-link").filter(l => l.source.id === d.id)
                        .transition().duration(100).style("opacity", 1);
                } else {
                    // --- Normal mode highlight ---
                    g.selectAll(".node").interrupt("hover").transition("hover").duration(50)
                        .style("opacity", 0.2);
                    g.selectAll(".link, .backward-link").interrupt("hover").transition("hover").duration(50)
                        .style("opacity", 0.2);

                    // Highlight hovered node
                    g.selectAll(".node").filter(n => n.id === d.id)
                        .transition("hover").duration(50).style("opacity", 1);

                    // Highlight forward-connected nodes (outer rect only)
                    g.selectAll(".node").filter(n =>
                        links.some(l => l.source.id === d.id && l.target.id === n.id)
                    ).select("rect.outer").transition("hover").duration(50).style("opacity", 1);

                    // Highlight backward-connected nodes (outer rect only)
                    g.selectAll(".node").filter(n =>
                        links.some(l => l.backward && l.source.id === d.id && l.target.id === n.id)
                    ).select("rect.outer").transition("hover").duration(50).style("opacity", 1);

                    // Highlight outgoing links
                    g.selectAll(".link, .backward-link").filter(l => l.source.id === d.id)
                        .transition("hover").duration(50).style("opacity", 1);
                }
            })
            .on("mouseout", function (event, d) {
                d.hovered = false;

                if (isBlindMode) {
                    // Hide node again if not start/end
                    if (d !== nodes[0] && d !== nodes[nodes.length - 1]) {
                        d3.select(this).transition().duration(100).style("opacity", 0);
                    }

                    // Hide neighbors
                    g.selectAll(".node").filter(n =>
                        links.some(l => (l.source.id === d.id && l.target.id === n.id) ||
                            (l.backward && l.source.id === d.id && l.target.id === n.id))
                    ).transition().duration(100).style("opacity", 0);

                    // Hide outgoing links
                    g.selectAll(".link, .backward-link").filter(l => l.source.id === d.id)
                        .transition().duration(100).style("opacity", 0);
                } else {
                    // Reset everything
                    g.selectAll(".node").interrupt("hover").transition("hover").duration(50).style("opacity", 1);
                    g.selectAll(".link, .backward-link").interrupt("hover").transition("hover").duration(50).style("opacity", 1);
                }
            });

        linkSel = linkSel.enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)")
            .merge(linkSel);

        simulation.nodes(nodes).on("tick", ticked);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();

        function ticked() {
            const circleY = isDoubly ? 80 : 58;
            const circleX = d => 10 + Math.max(60, d.text.length * 8) / 2;

            // --- LINKS ---
            const linkSel = g.selectAll(".link, .backward-link")
                .data(links, d => d.source.id + "-" + d.target.id + (d.backward ? "-b" : ""));

            // exit
            linkSel.exit().remove();

            // enter
            const linkEnter = linkSel.enter()
                .append("line")
                .attr("class", d => d.backward ? "backward-link" : "link")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#arrow)")
                .style("opacity", d => (isBlindMode ? 0 : 1));

            // merge
            const allLinks = linkEnter.merge(linkSel);
            allLinks.each(function (d, i) {
                const line = d3.select(this);
                const gradId = `link-gradient-${d.source.id}-${d.target.id}${d.backward ? "-b" : ""}`;
                let grad = defs.select(`#${gradId}`);
                if (grad.empty()) {
                    grad = defs.append("linearGradient")
                        .attr("id", gradId)
                        .attr("gradientUnits", "userSpaceOnUse");
                    grad.append("stop").attr("offset", "0%").attr("stop-color", "#ff4d4d");
                    grad.append("stop").attr("offset", "40%").attr("stop-color", "white");
                }
                const xStart = d.source.x + circleX(d.source) + (d.backward ? -15 : 15);
                const yStart = d.source.y + (d.backward ? 20 : (isDoubly ? 80 : 58));
                const xEnd = d.target.x + circleX(d.target) + (d.backward ? 15 : -15);
                const yEnd = d.target.y + (d.backward ? 20 : (isDoubly ? 80 : 58));
                grad.attr("x1", xStart).attr("y1", yStart).attr("x2", xEnd).attr("y2", yEnd);
                line.attr("x1", xStart)
                    .attr("y1", yStart)
                    .attr("x2", xEnd)
                    .attr("y2", yEnd)
                    .attr("stroke", `url(#${gradId})`);
            });

            // --- NODES ---
            const nodeSel = g.selectAll(".node")
                .data(nodes, d => d.id);

            nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);

            // --- POINTERS ---
            g.selectAll(".start-pointer, .end-pointer, .null-pointer").remove();

            if (nodes.length > 0) {
                const startNode = nodes[0];
                const endNode = nodes[nodes.length - 1];
                const gap = 30;
                const circleY = isDoubly ? 80 : 58;
                const circleXVal = d => 10 + Math.max(60, d.text.length * 8) / 2;
                const leftCircleX = circleXVal(startNode) - gap / 2;
                const rightCircleX = circleXVal(endNode) + gap / 2;

                // Gradient for null pointers
                let nullGrad = defs.select("#null-pointer-gradient");
                if (nullGrad.empty()) {
                    nullGrad = defs.append("linearGradient")
                        .attr("id", "null-pointer-gradient")
                        .attr("gradientUnits", "userSpaceOnUse");
                    nullGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ff4d4d");
                    nullGrad.append("stop").attr("offset", "40%").attr("stop-color", "white");

                }

                if (nodes.length === 1) {
                    // Single node
                    // Start pointer (solid)
                    g.append("line")
                        .attr("class", "start-pointer")
                        .attr("x1", startNode.x + leftCircleX - 50)
                        .attr("y1", startNode.y + circleY)
                        .attr("x2", startNode.x + leftCircleX - 5)
                        .attr("y2", startNode.y + circleY)
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)");

                    g.append("text")
                        .attr("class", "start-pointer")
                        .attr("x", startNode.x + leftCircleX - 80)
                        .attr("y", startNode.y + circleY + 5)
                        .attr("fill", "white")
                        .attr("text-anchor", "middle")
                        .text("Start");

                    // End pointer (solid)
                    g.append("line")
                        .attr("class", "end-pointer")
                        .attr("x1", startNode.x + leftCircleX)
                        .attr("y1", startNode.y + circleY + 50)
                        .attr("x2", startNode.x + leftCircleX)
                        .attr("y2", startNode.y + circleY + 5)
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)");

                    g.append("text")
                        .attr("class", "end-pointer")
                        .attr("x", startNode.x + leftCircleX)
                        .attr("y", startNode.y + circleY + 65)
                        .attr("fill", "white")
                        .attr("text-anchor", "middle")
                        .text("End");

                    // Null pointer with gradient
                    g.append("line")
                        .attr("class", "null-pointer")
                        .attr("x1", startNode.x + rightCircleX)
                        .attr("y1", startNode.y + circleY)
                        .attr("x2", startNode.x + rightCircleX + 50)
                        .attr("y2", startNode.y + circleY)
                        .attr("stroke", "url(#null-pointer-gradient)")
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)");

                    g.append("text")
                        .attr("class", "null-pointer")
                        .attr("x", startNode.x + rightCircleX + 80)
                        .attr("y", startNode.y + circleY + 5)
                        .attr("fill", "white")
                        .attr("text-anchor", "middle")
                        .text("Null");

                    if (isDoubly) {
                        // Left null pointer gradient
                        g.append("line")
                            .attr("class", "null-pointer")
                            .attr("x1", startNode.x + leftCircleX - 5)
                            .attr("y1", startNode.y + 20)
                            .attr("x2", startNode.x + leftCircleX - 50)
                            .attr("y2", startNode.y + 20)
                            .attr("stroke", "url(#null-pointer-gradient)")
                            .attr("stroke-width", 2)
                            .attr("marker-end", "url(#arrow)");

                        g.append("text")
                            .attr("class", "null-pointer")
                            .attr("x", startNode.x + leftCircleX - 80)
                            .attr("y", startNode.y + 25)
                            .attr("fill", "white")
                            .attr("text-anchor", "middle")
                            .text("Null");
                    }
                } else {
                    // Multiple nodes
                    // Start pointer (solid)
                    g.append("line")
                        .attr("class", "start-pointer")
                        .attr("x1", startNode.x + leftCircleX)
                        .attr("y1", startNode.y + circleY + 50)
                        .attr("x2", startNode.x + leftCircleX)
                        .attr("y2", startNode.y + circleY)
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)");

                    g.append("text")
                        .attr("class", "start-pointer")
                        .attr("x", startNode.x + leftCircleX)
                        .attr("y", startNode.y + circleY + 65)
                        .attr("fill", "white")
                        .attr("text-anchor", "middle")
                        .text("Start");

                    // End pointer (solid)
                    g.append("line")
                        .attr("class", "end-pointer")
                        .attr("x1", endNode.x + leftCircleX)
                        .attr("y1", endNode.y + circleY + 50)
                        .attr("x2", endNode.x + leftCircleX)
                        .attr("y2", endNode.y + circleY)
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)");

                    g.append("text")
                        .attr("class", "end-pointer")
                        .attr("x", endNode.x + leftCircleX)
                        .attr("y", endNode.y + circleY + 65)
                        .attr("fill", "white")
                        .attr("text-anchor", "middle")
                        .text("End");

                    // Null pointer right (gradient)
                    if (!isCircular) {
                        g.append("line")
                            .attr("class", "null-pointer")
                            .attr("x1", endNode.x + rightCircleX)
                            .attr("y1", endNode.y + circleY)
                            .attr("x2", endNode.x + rightCircleX + 50)
                            .attr("y2", endNode.y + circleY)
                            .attr("stroke", "url(#null-pointer-gradient)")
                            .attr("stroke-width", 2)
                            .attr("marker-end", "url(#arrow)");

                        g.append("text")
                            .attr("class", "null-pointer")
                            .attr("x", endNode.x + rightCircleX + 80)
                            .attr("y", endNode.y + circleY + 5)
                            .attr("fill", "white")
                            .attr("text-anchor", "middle")
                            .text("Null");
                    }

                    // Null pointer left (gradient) for doubly linked
                    if (isDoubly && !isCircular) {
                        g.append("line")
                            .attr("class", "null-pointer")
                            .attr("x1", startNode.x + leftCircleX - 5)
                            .attr("y1", startNode.y + 20)
                            .attr("x2", startNode.x + leftCircleX - 50)
                            .attr("y2", startNode.y + 20)
                            .attr("stroke", "url(#null-pointer-gradient)")
                            .attr("stroke-width", 2)
                            .attr("marker-end", "url(#arrow)");

                        g.append("text")
                            .attr("class", "null-pointer")
                            .attr("x", startNode.x + leftCircleX - 80)
                            .attr("y", startNode.y + 25)
                            .attr("fill", "white")
                            .attr("text-anchor", "middle")
                            .text("Null");
                    }
                }
            }

            // --- HIGHLIGHT ---
            g.selectAll(".node.highlight").selectAll("rect, circle")
                .transition().duration(400).style("opacity", 0.3)
                .transition().duration(400).style("opacity", 1)
                .transition().duration(400).style("opacity", 0.3)
                .transition().duration(400).style("opacity", 1)
                .on("end", function () {
                    d3.select(this.parentNode).classed("highlight", false);
                });
        }
    }

    function dragstarted(event, d) {
        d.dragging = true;
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        d.dragging = false;
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    const zoom = d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => {
        g.attr("transform", event.transform);
    });
    svg.call(zoom);

    function updateNodePositions() {
        const startX = window.innerWidth / 2;
        const y = window.innerHeight / 3;
        const gap = 150;

        nodes.forEach((d, i) => {
            if (!d.hasPosition) {
                let prev = nodes[i - 1];
                if (!prev || prev.fx != null) {
                    d.x = startX + i * gap;
                } else {
                    d.x = prev.x + gap;
                }
                d.y = y;
                d.hasPosition = true;
            }
        });
    }

    function rebuildLinks() {
        links = [];

        for (let i = 0; i < nodes.length - 1; i++) {
            links.push({ source: nodes[i], target: nodes[i + 1] });
        }

        if (isCircular && nodes.length > 1) {
            links.push({ source: nodes[nodes.length - 1], target: nodes[0] });
        }

        if (isDoubly && nodes.length > 1) {
            for (let i = 1; i < nodes.length; i++) {
                links.push({ source: nodes[i], target: nodes[i - 1], backward: true });
            }
            if (isCircular && nodes.length > 1) {
                links.push({ source: nodes[0], target: nodes[nodes.length - 1], backward: true });
            }
        }
        updateNodePositions();
        updateNodeCount();
        updateGraph();
    }

    function updateNodeCount() {
        const countSpan = document.getElementById("nodeCount");
        countSpan.textContent = nodes.length;
    }

    function updateListType() {
        const typeSpan = document.getElementById("list-type");
        let type = "";
        if (isCircular && isDoubly) type = "Doubly Circular ";
        else if (isCircular) type = "Singly Circular";
        else if (isDoubly) type = "Doubly Linear";
        else type = "Singly Linear";
        typeSpan.textContent = type;
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

        isBlindMode = false;
        g.selectAll(".node").style("opacity", 1);
        g.selectAll(".link, .backward-link").style("opacity", 1);
        d3.select("svg rect").attr("fill", "url(#grid)");
        document.getElementById("toggleBlindModeBtn").textContent = "Blind: OFF";
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
        updateListType();
        logStatus(`List: ${isDoubly ? "Doubly" : "Singly"} ${isCircular ? "Circular" : "Linear"}`, "info");
    }

    function toggleDoubly() {
        isDoubly = !isDoubly;
        toggleDoublyBtn.textContent = isDoubly ? "Make Singly" : "Make Doubly";
        rebuildLinks();
        updateListType();
        logStatus(`List: ${isDoubly ? "Doubly" : "Singly"} ${isCircular ? "Circular" : "Linear"}`, "info");
    }

    function logStatus(msg, type = "info", timeout = 4000) {
        const feed = document.getElementById("status-feed");
        const entry = document.createElement("div");
        entry.classList.add("status-msg");

        if (type === "error") entry.classList.add("status-error");
        if (type === "success") entry.classList.add("status-success");
        if (type === "info") entry.classList.add("status-info");
        if (type === "delete") entry.classList.add("status-delete");

        entry.textContent = `${msg}`;
        feed.appendChild(entry);
        feed.scrollTop = feed.scrollHeight;

        setTimeout(() => {
            entry.classList.add("fade-out");
            setTimeout(() => entry.remove(), 400);
        }, timeout);
    }

    // --- INSERTION DELETION ---
    function insertNodeStart() {
        const data = datainput.value.trim();
        if (!data) return logStatus("Please enter a value to insert", "error");

        nodes.unshift({ id: nextId++, text: data });
        rebuildLinks();
        logStatus(`Node "${data}" added at the start`, "success");
        datainput.value = "";
    }

    function insertNodeEnd() {
        const data = datainput.value.trim();
        if (!data) return logStatus("Please enter a value to insert", "error");

        nodes.push({ id: nextId++, text: data });
        rebuildLinks();
        logStatus(`Node "${data}" added at the end`, "success");
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
        logStatus(`Node "${removed.text}" deleted from start`, "delete");
    }

    function deleteNodeEnd() {
        if (!nodes.length) return logStatus("List is empty", "error");

        const removed = nodes.pop();
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted from end`, "delete");
    }

    function deleteBeforeNode() {
        const ref = elementinput.value.trim();
        if (!ref) return logStatus("Reference element required", "error");

        const index = nodes.findIndex(n => n.text === ref);
        if (index <= 0) return logStatus("No node exists before this reference", "error");

        const removed = nodes.splice(index - 1, 1)[0];
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted before "${ref}"`, "delete");
        elementinput.value = "";
    }

    function deleteAfterNode() {
        const ref = elementinput.value.trim();
        if (!ref) return logStatus("Reference element required", "error");

        const index = nodes.findIndex(n => n.text === ref);
        if (index === -1 || index === nodes.length - 1) return logStatus("No node exists after this reference", "error");

        const removed = nodes.splice(index + 1, 1)[0];
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted after "${ref}"`, "delete");
        elementinput.value = "";
    }

    function deleteAt() {
        const pos = parseInt(posinput.value.trim(), 10);
        if (isNaN(pos)) return logStatus("Valid position required", "error");
        if (pos < 1 || pos > nodes.length) return logStatus("Position out of range", "error");

        const removed = nodes.splice(pos - 1, 1)[0];
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted at position ${pos}`, "delete");
        posinput.value = "";
    }

    function deleteValue() {
        const value = elementinput.value.trim();
        if (!value) return logStatus("Valid value required", "error");

        const index = nodes.findIndex(n => n.text === value);
        if (index === -1) return logStatus(`Value "${value}" not found`, "error");

        const removed = nodes.splice(index, 1)[0];
        rebuildLinks();
        logStatus(`Node "${removed.text}" deleted (by value)`, "delete");
        elementinput.value = "";
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
                g.selectAll(".node")
                    .filter(d => d.id === node.id)
                    .classed("highlight", true);

                const index = nodes.indexOf(node);
                const dataCellWidth = Math.max(60, node.text.length * 8);

                // Adjust position depending on list type
                const markerX = node.x + 10 + dataCellWidth / 2;
                const markerY = node.y - (isDoubly ? 20 : 10);

                g.append("text")
                    .attr("class", "highlight-marker")
                    .attr("x", markerX)
                    .attr("y", markerY)
                    .attr("text-anchor", "middle")
                    .attr("fill", "rgb(255, 255, 143)")
                    .attr("font-weight", "bold")
                    .style("opacity", 1)
                    .text(`Index: ${index + 1}`)
                    .transition()
                    .duration(1600)
                    .transition()
                    .duration(400)
                    .style("opacity", 0)
                    .remove();
            });

            // highlight nodes
            g.selectAll(".node.highlight").selectAll("rect, circle")
                .classed("flash", true);

            // highlight links
            g.selectAll(".link, .backward-link")
                .filter(l => matchingNodes.some(n => l.source.id === n.id))
                .classed("flash", true);

            // cleanup after animation ends
            setTimeout(() => {
                g.selectAll(".node.highlight")
                    .classed("highlight", false)
                    .selectAll("rect, circle").classed("flash", false);

                g.selectAll(".link, .backward-link").classed("flash", false);
            }, 3 * 800); // match cycles*duration

            logStatus(
                `Found ${matchingNodes.length} ${matchingNodes.length === 1 ? "instance" : "instances"} of "${value}"`,
                "success"
            );
        } else { logStatus(`"${value}" not present`, "error"); }
        searchInput.value = "";
    };

    function toggleControls() {
        if (controlWrapper.classList.contains("hidden")) {
            controlWrapper.style.display = "block";
            requestAnimationFrame(() => {
                controlWrapper.classList.remove("hidden");
            });
            toggleControlsBtn.classList.toggle("top");
            toggleControlsBtn.textContent = "↓ Controls";
        } else {
            controlWrapper.classList.add("hidden");
            toggleControlsBtn.classList.toggle("top");
            toggleControlsBtn.textContent = "↑ Controls";
            controlWrapper.addEventListener(
                "transitionend",
                function handler(e) {
                    if (e.propertyName === "transform") {
                        controlWrapper.style.display = "none";
                        controlWrapper.removeEventListener("transitionend", handler);
                    }
                }
            );
        }
    }

    function toggleSidebar() {
        sidebarWrapper.classList.toggle("hidden");

        if (sidebarWrapper.classList.contains("hidden")) {
            toggleSidebarBtn.classList.toggle("left");
            toggleSidebarBtn.textContent = "↤ Code {}";
            dynamicPanelWrapper.classList.add("hidden");
        } else {
            toggleSidebarBtn.classList.toggle("left");
            toggleSidebarBtn.textContent = "⇥ Code {}";
        }
    }

    function toggleBlindMode() {
        isBlindMode = !isBlindMode;

        const bgRect = d3.select("svg rect"); // selects your full-size rect

        if (isBlindMode) {
            g.selectAll(".node").style("opacity", 0);
            g.selectAll(".link, .backward-link").style("opacity", 0);

            // Change background fill
            bgRect.attr("fill", "#12121f"); // dark color

            logStatus("Blind mode enabled: Only start/end pointers visible", "info");
            toggleBlindModeBtn.textContent = "Blind: ON";
        } else {
            g.selectAll(".node").style("opacity", 1);
            g.selectAll(".link, .backward-link").style("opacity", 1);

            // Restore grid pattern
            bgRect.attr("fill", "url(#grid)");

            logStatus("Blind mode disabled", "info");
            toggleBlindModeBtn.textContent = "Blind: OFF";
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
    deleteValueBtn.addEventListener("click", deleteValue);

    toggleCircularBtn.addEventListener("click", toggleCircular);
    toggleDoublyBtn.addEventListener("click", toggleDoubly);
    clearCanvasBtn.addEventListener("click", clearCanvas);
    searchBtn.addEventListener("click", performSearch);
    toggleBlindModeBtn.addEventListener("click", toggleBlindMode);

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



    document.getElementById("copyCodeBtn").addEventListener("click", async () => {
        const codeEl = document.getElementById("codeContainer");
        if (!codeEl) return logStatus("Code container not found", "error");

        const codeText = codeEl.textContent.trim();
        if (!codeText) return logStatus("No code to copy", "error");

        try {
            await navigator.clipboard.writeText(codeText);
            logStatus("Code copied to clipboard!", "success");
        } catch (err) {
            console.error(err);
            logStatus("Failed to copy code", "error");
        }
    });

    svg.on("mousedown", (event) => {
        if (event.button === 1) { // middle mouse button
            event.preventDefault();
            if (nodes.length === 0) return;

            // Compute node bounding box
            const minX = d3.min(nodes, d => d.x);
            const maxX = d3.max(nodes, d => d.x + Math.max(60, d.text.length * 8) + 20);
            const minY = d3.min(nodes, d => d.y);
            const maxY = d3.max(nodes, d => d.y + 100);

            const width = maxX - minX;
            const height = maxY - minY;

            const svgWidth = svg.node().clientWidth;
            const svgHeight = svg.node().clientHeight;

            // Determine scale, respecting max zoom of 3
            const scale = Math.min(svgWidth / (width + 100), svgHeight / (height + 100), 3);

            // Center the bounding box in the SVG
            const translateX = (svgWidth - scale * (minX + maxX)) / 2;
            const translateY = (svgHeight - scale * (minY + maxY)) / 2;

            const t = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

            // Smooth transition to the new transform
            svg.transition()
                .duration(750)
                .call(zoom.transform, t);
        }
    });

});