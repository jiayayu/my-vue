/**
 * 用来递归劫持监听 vue.data 中的所有属性 监听器
 * @param {*} data vue中data
 */
function observe(data) {
    if (!data || typeof data !== 'object') {
        return
    }
    console.log('data', data);
    // do hijack
    Object.keys(data).forEach(function(key) {
        doHijack(data, key, data[key]);
    })
}
/**
 * 对data对象中data[key]属性做数据劫持
 * @param {*} data 包含要处理属性的的对象
 * @param {*} key 要处理的属性的键值key
 * @param {*} val 初始值
 */
function doHijack(data, key, val) {
    var dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            if (Dep.target) {
                dep.addSub(Dep.target); // 添加一个订阅者
            }
            return val;
        },
        set: function(value) {
            if (val === value) {
                return
            }
            val = value;
            console.log('属性' + key + '已经被监听了，现在值为：“' + value.toString() + '”');
            dep.notify(); // 数据改变，通知所有订阅者.
        }
    })
    observe(val);
}

/**
 * 消息订阅器 用来收集订阅者watcher
 */
function Dep() {
    this.subs = [];
}
Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        })
    },
}
Dep.target = null;