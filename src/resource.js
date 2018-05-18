// const system = global.system

class Resource {
    constructor(rid, amount) {
        // system.resources[rid] = this
        this.rid = rid
        this.amount = amount
        this.availableCount = amount
        this.waitingList = [] // {pid(进程的名称), process(对进程的引用), number(申请资源的数量)}
    }

    // 中断某进程对该任务的等待
    abortProcessWaiting(pid) {
        for (let i = 0, length = this.waitingList.length; i < length; i++) {
            const currentPid = this.waitingList[i].pid
            if (currentPid === pid) {
                this.waitingList.splice(i, 1)
            }
        }
    }

    // 销毁进程导致进程所持有的资源被释放
    addAvailableCount(count) {
        this.availableCount += count
    }

    // 插入进程到等待队列中
    insertProcessIntoWaitingList(p, number) {
        this.waitingList.push({
            pid: p.pid,
            process: p,
            number
        })
    }
}

module.exports = Resource