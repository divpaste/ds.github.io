class Node{
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

let start = null;

function createLL() {
    let val = parseInt(document.getElementById("val").value);
    let ptr = new Node(val);

    if (start === null) {
        start = ptr;
    } else {
        let temp = start;
        while (temp.next != null) {
            temp = temp.next;
        }
        temp.next = ptr;
    }

    let existingNull = document.getElementById("null-marker");
    if (existingNull) {
        existingNull.remove();
    }

    let box = document.createElement("div");
    box.className = "box";
    box.innerText = val;
    document.getElementById("canvas").appendChild(box);

    let arrow = document.createElement("img");
    arrow.className = "arrow";
    arrow.src = "arrow.png";
    document.getElementById("canvas").appendChild(arrow);

    let nullArrow = document.createElement("div");
    nullArrow.id = "null-marker";
    nullArrow.innerText = "NULL";
    document.getElementById("canvas").appendChild(nullArrow);

    document.getElementById("val").value = "";
}

function printLL(){
    let temp = start;
    let str = "";
    if(start===null){
        alert("list is empty");
        return;
    }
    let n=0;
    while(temp!=null){
        if(n!=0){
            str = str + ",";
        }
        str = str + temp.data;
        temp=temp.next;
        n++;
    }
    alert(`List:${str}`);
}