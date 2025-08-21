class Node{
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

let start = null;
let end = null;

let addBtn = document.getElementById("addBtn");

addBtn.addEventListener("click",()=>{
    let data;
    do{
        data = prompt("Enter Int data:");
    }while(data.trim()==="");
    let newNode = new Node(data);
    newNode.next=null;
    if(start==null){
        start = end = newNode;
    }
    else{
        end.next = newNode;
        end = newNode;
    }
    vis(newNode);
});

function vis(Node){
    let llarea = document.getElementById("ll-area");
        // llarea.innerHTML += `
        //     <div class="node justCreated">
        //         <h2 class="nodeinfo data">DATA<br>[${Node.data}]</h2>
        //             <h2 class="nodeinfo sep"></h2>
        //             <h2 class="nodeinfo ptr">NEXT</h2>
        //     </div>
        //     `;
    const newDiv = document.createElement("div");
    newDiv.classList.add("node", "justCreated");
    newDiv.innerHTML = `
        <h2 class="nodeinfo data">DATA<br>[${Node.data}]</h2>
        <h2 class="nodeinfo sep"></h2>
        <h2 class="nodeinfo ptr">NEXT</h2>
    `;
    llarea.appendChild(newDiv);
    const newHtmlNode = llarea.lastElementChild;
    newHtmlNode.addEventListener("animationend", () => {
    newHtmlNode.classList.remove("justCreated");
    });
}

function printLL(){
    let temp = start;
    let result = "";
    if(start==null){
        console.log("emptylist");
        return;
    }
    while(temp!=null){
        result = result + temp.data + " -> " ;
        temp = temp.next;
    }
    console.log(result);
}
