class System {
    constructor() {
        this.readyList = [
            [],
            [],
            []
        ]
        this.blockList = []
        this.processes = {}
        this.resources = {}
        this.runningProcess = null
    }

    // 调度最高优先级的进程执行
    scheduleHighestPriorityProcess() {
        const highestPriorityProcess = this.findHighestPriorityProcess()

        if (this.runningProcess === null ||
            this.runningProcess.type !== 'running' ||
            highestPriorityProcess.priority > this.runningProcess.priority) {
            highestPriorityProcess.type = 'running'
            this.runningProcess = highestPriorityProcess
        }
    }

    // 寻找最高优先级的进程
    findHighestPriorityProcess() {
        for (let i = 2; i >= 0; i--) {
            for (let j = 0, length = this.readyList[i].length; j < length; j++) {
                return this.readyList[i][j]
            }
        }
    }

    // 时钟中断
    clockInterrupt() {
        const p = this.runningProcess
        this.runningProcess = null

        p.removeFromReadyList()
        p.type = 'ready'
        p.insertIntoReadyList()

        this.scheduleHighestPriorityProcess()
    }

    // 销毁进程
    destroyProcess(pid) {
        const p = this.processes[pid]
        p.destroy()

        this.scheduleHighestPriorityProcess()
    }

    // 请求资源
    requestResources(rid, number = 1) {
        const resource = this.resources[rid]
        const p = this.runningProcess

        // 若请求的资源数量是否超过资源的最大数量，则抛出异常
        if (number > resource.amount) {
            throw new Error(`请求的资源${rid}数量是否超过资源的最大数量${resource.amount}`)
        }

        if (resource.availableCount >= number) {
            resource.availableCount -= number
            p.resources.push({
                rid,
                number,
                resource
            })
        } else {
            p.removeFromReadyList()
            p.type = 'block'
            p.insertIntoBlockList()
            resource.insertProcessIntoWaitingList(p, number)
        }

        this.scheduleHighestPriorityProcess()
    }

    // 释放资源
    releaseResources(rid, number = 1) {
        const resource = this.resources[rid]
        const p = this.runningProcess

        // 释放进程持有的该资源
        p.releaseSpecialResources(rid, number)

        // 增加资源可用的数量
        resource.addAvailableCount(number)

        // 若资源的等待队列中有等待的进程，则检查是否能够执行
        const waitingList = resource.waitingList
        if (waitingList.length !== 0) {
            const nextWaiting = waitingList[0]

            // 该进程可以获取到该资源
            if (resource.availableCount >= nextWaiting.number) {
                resource.availableCount -= nextWaiting.number

                waitingList.shift()

                const nextProcess = nextWaiting.process
                nextProcess.resources.push({
                    rid,
                    resource,
                    number: nextWaiting.number
                })

                nextProcess.insertIntoBlockList()
                p.type = 'ready'
                nextProcess.insertIntoReadyList()

                this.scheduleHighestPriorityProcess()
            }
        }
    }


}

module.exports = System