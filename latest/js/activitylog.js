class logNode {
    constructor(prev, value, next) {
        this.prev = prev;
        this.value = value;
        this.next = next;
    }
}

class logLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    addToHead(value) {
        const logNode = new logNode(null, value, this.head);
        if (this.head) {
            this.head.prev = logNode;
        } else {
            this.tail = logNode;
        }
        this.head = logNode;
        this.length++;
    }

    push(value) {
        this.addToHead(value);
        return this.length;
    }

    addToTail(value) {
        const logNode = new logNode(this.tail, value, null);
        if (this.tail) {
            this.tail.next = logNode;
        } else {
            this.head = logNode;
        }
        this.tail = logNode;
        this.length++;
    }

    removeHead() {
        if (!this.head) {
            return null;
        }
        const value = this.head.value;
        this.head = this.head.next;
        if (!this.head) {
            this.tail = null;
        }
        this.length--;
        return value;
    }

    removeTail() {
        if (!this.tail) {
            return null;
        }
        const value = this.tail.value;
        this.tail = this.tail.prev;
        if (!this.tail) {
            this.head = null;
        }
        this.length--;
        return value;
    }

    search(value) {
        let current = this.head;
        while (current) {
            if (current.value === value) return value;
            current = current.prev;
        }
        return null;
    }

    indexOf(value) {
        const indexes = [];
        let current = this.tail;
        let index = 0;
        while (current) {
            if (current.value === value) indexes.push(index);
            current = current.next;
            index++;
        }
        return indexes;
    }
}