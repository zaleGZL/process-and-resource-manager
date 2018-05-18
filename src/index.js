const System = require('./system')
const system = new System()

// 将变量导出到全局
global.system = system

const Process = require('./process')
const Resource = require('./resource')

// 初始化默认资源


system.resources = {
    'R1': new Resource('R1', 1),
    'R2': new Resource('R2', 2),
    'R3': new Resource('R3', 3),
    'R4': new Resource('R4', 4),
}


const getInputData = require('./inputHandler')
const inputData = getInputData(__dirname + '/input.txt')
let result = []

for (let i = 0, length = inputData.length; i < length; i++) {
    const data = inputData[i]

    switch (data[0]) {
        case 'init':
            {
                new Process('init', 0)
            }
            break;
        case 'cr':
            {
                new Process(data[1], Number(data[2]))
            }
            break;
        case 'de':
            {
                system.destroyProcess(data[1])
            }
            break;
        case 'req':
            {
                system.requestResources(data[1], Number(data[2]))
            }
            break;
        case 'rel':
            {
                system.releaseResources(data[1], Number(data[2]))
            }
            break;
        case 'to':
            {
                system.clockInterrupt()
            }
            break;
    }
    if (system.runningProcess !== null) {
        result.push(system.runningProcess.pid)
    }
}

console.log(result.join(' '))
