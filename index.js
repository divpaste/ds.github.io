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

    const existingNull = llarea.querySelector('.null');
    if (existingNull) existingNull.remove();

    const newDiv = document.createElement("div");
    newDiv.classList.add("node", "justCreated");
    newDiv.innerHTML = `
        <h2 class="nodeinfo data">DATA<br>[${Node.data}]</h2>
        <h2 class="nodeinfo sep"></h2>
        <h2 class="nodeinfo ptr">NEXT</h2>
    `;
    llarea.appendChild(newDiv);

    const arrowDiv = document.createElement("div");
    arrowDiv.classList.add("arrow","justCreated");
    arrowDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60">
            <path d="m18.707 12.707-3 3a1 1 0 0 1-1.414-1.414L15.586 13H6a1 1 0 0 1 0-2h9.586l-1.293-1.293a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414z" fill="#1c1b1e"/>
        </svg>
        `;
    llarea.appendChild(arrowDiv);

    const nullDiv = document.createElement("div");
    nullDiv.classList.add("null","justCreated");
    nullDiv.innerHTML = `
        <h2 class="null">NULL</h2>
    `;
    llarea.appendChild(nullDiv);

    // llarea.lastElementChild.addEventListener("animationend", () => {
    // llarea.lastElementChild.classList.remove("justCreated");
    // });
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
