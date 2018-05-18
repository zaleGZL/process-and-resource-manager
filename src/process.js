const system = global.system

class Process {
    constructor(pid, priority) {
        this.init(pid, priority)
        this.linkParentProcess()
        this.insertIntoReadyList()
        system.scheduleHighestPriorityProcess()
    }

    // 初始化进程
    init(pid, priority) {
        system.processes[pid] = this

        this.pid = pid
        this.resources = [] // {rid(资源名称), number(资源数量), resource(对资源的引用)}
        this.type = 'ready'
        this.parent = null
        this.children = [] // [process(对子进程的引用)]
        this.priority = priority
    }

    // 连接父进程
    linkParentProcess() {
        if (this.pid !== 'init') {
            this.parent = system.runningProcess
            this.parent.children.push(this)
        }
    }

    // 插入就绪相应优先级队列的尾部
    insertIntoReadyList() {
        system.readyList[this.priority].push(this)
    }

    // 插入阻塞队列的尾部
    insertIntoBlockList() {
        system.blockList.push(this)
    }

    // 从就绪队列中移除进程
    removeFromReadyList() {
        for (let i = 2; i >= 0; i--) {
            for (let j = 0, length = system.readyList[i].length; j < length; j++) {
                if (this === system.readyList[i][j]) {
                    system.readyList[i].splice(j, 1)
                    return
                }
            }
        }
    }

    // 从阻塞队列中移除进程
    removeFromBlockList() {
        const blockList = system.blockList
        for (let i = 0, length = blockList.length; i < length; i++) {
            if (this === blockList[i]) {
                blockList.splice(i, 1)
                return
            }
        }
    }

    // 销毁进程
    destroy() {
        // 该进程没有子进程，则直接销毁该进程
        if (this.children.length === 0) {
            // 若当前正在运行的进程是要被销毁的进程
            if (system.runningProcess === this) {
                system.runningProcess = null
            }

            system.processes[this.pid] = undefined

            this.releaseResources()
            // 若存在则移出
            this.removeFromReadyList()
            this.removeFromBlockList()
        }

        this.children.forEach(item => {
            item.destroy()
        })
    }

    // 释放资源
    releaseResources() {
        // 释放已获取到的资源
        this.resources.forEach(item => {
            system.releaseResources(item.rid, item.number)
        })

        // 释放正在获取但还没有获到的资源（当前处于阻塞状态）
        let resources = system.resources
        for (let key in resources) {
            let waitingList = resources[key].waitingList

            for (let i = waitingList.length - 1; i >= 0; i--) {
                if (waitingList[i].process === this) {
                    waitingList.splice(i, 1)
                }
            }
        }
    }

    // 释放指定的资源
    releaseSpecialResources(rid, number) {
        const resources = this.resources
        for (let i = 0, length = resources.length; i < length; i++) {
            if (resources[i].rid === rid && resources[i].number === number) {
                resources.splice(i, 1)
                return
            }
        }
    }
}

module.exports = Process