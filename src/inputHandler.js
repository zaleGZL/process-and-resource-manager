const fs = require('fs')

// 获取文件中的输入的数据

function getInputData(path) {
    // 存放输入数据的数组
    const result = []

    // 获取 input.txt 文件中的输入信息
    const input = String(fs.readFileSync(path)).trim().split(/\s*\r?\n\s*/g)

    // 迭代提取数据信息
    input.forEach(item => {
        const itemArray = item.trim().split(/\s+/g)
        result.push(itemArray)
    })

    return result
}

module.exports = getInputData