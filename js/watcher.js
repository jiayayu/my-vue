/**
 * 订阅者
 * @param {*} vm vm实例
 * @param {*} exp vue.data[key] 中的key值
 * @param {*} cb 回调函数
 */
function Watcher(vm, exp, cb) {
    this.cb = cb; // fn 数据更新后用于更新视图的回调函数
    this.vm = vm; // vm实例
    this.exp = exp; // vue.data[key] 中的key值
    this.value = this.get(); // 将自己添加到订阅器
}
Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var newVal = this.vm.data[this.exp];
        var oldVal = this.value;
        if (newVal !== oldVal) {
            this.value = newVal;
            this.cb.call(this.vm, newVal, oldVal); // 执行回调更新视图
        }
    },
    get: function() {
        Dep.target = this; // 将自己（一个watcher实例）缓存,以便添加到对应的dep中
        var value = this.vm.data[this.exp]; // 强制触发监听器里的get函数 将自己加入对应的消息订阅器dep中
        Dep.target = null; // 释放自己
        return value;
    },
}