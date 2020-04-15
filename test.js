function parseString(text) {
    return text.replace(/\\(.?)/g, function (match, char) {
        if (char == '\\') return '\\';
        if (char == 'n') return '\n';
        if (char == 't') return '\t';
        if (char == '') return '';
        return char;
    });
}


let test = {}

test.classTest = class {
    constructor(price) {
        this.price = price;
    }

    getPrice() {
        console.log(`The price is ${this.price}!!`);
    }
}

function getClass() {
    return class {
        constructor(price) {
            this.price = price;
        }
    
        getPrice() {
            console.log(`The price is ${this.price}!!`);
        }
    }
}

// let car = new test.classTest(65)
let car = new (new getClass())(87)

console.log(car.getPrice())