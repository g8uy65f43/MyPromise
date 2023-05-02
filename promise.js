class Promise {
    constructor(executor) {
        this.PromiseState = "pending"
        this.PromiseResult = null
        const self = this
        this.callbacks = []
        function resolve(data) {
            if (self.PromiseState !== "pending") return
            self.PromiseState = "resolve"
            self.PromiseResult = data
            setTimeout(() => {

                self.callbacks.forEach(item => {
                    item.onResolved(data)
                })
            });
        }
        function reject(data) {
            if (self.PromiseState !== "pending") return
            self.PromiseState = "reject"
            self.PromiseResult = data
            setTimeout(() => {

                self.callbacks.forEach(item => {
                    item.onReject(data)
                })
            });
        }
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }
    then(onResolved, onReject) {
        const self = this

        return new Promise((resolve, reject) => {
            /* 封裝callback */
            function callback(type) {
                try {
                    /* 用傳入的type來決定要運行哪個函數 */
                    const result = type(self.PromiseResult)
                    /* 如果result是Promise則在進行判斷 */
                    if (result instanceof Promise) {
                        result.then(v => {
                            resolve(v)
                        }, p => { reject(p) })
                    }/* 非Promise的任何都為成功 */
                    else {
                        resolve(result)
                    }
                } catch (error) {
                    /* 如報錯則改狀態+返回error */
                    reject(error)
                }
            }
            /* 判定成功 */

            if (self.PromiseState === "resolve") {
                setTimeout(() => {

                    callback(onResolved)
                });
            }
            /*  判定失敗 */
            if (self.PromiseState === "reject") {
                setTimeout(() => {
                    callback(onReject)

                });
            }
            /* 未改狀態 */
            if (self.PromiseState === "pending") {
                this.callbacks.push(
                    {
                        onResolved: function () {
                            callback(onResolved)
                        },

                        onReject: function () {
                            callback(onReject)
                        }

                    }
                )



            }

        })
    }

    static resolve(value) {
        //返回promise对象
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(v => {
                    resolve(v);
                }, r => {
                    reject(r);
                })
            } else {
                //状态设置为成功
                resolve(value);
            }
        });
    }

    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }
    all(promise) {
        return new Promise((resolve, reject) => {
            let arr = []
            let count = 0
            for (let i = 0; i < promise.length; i++) {
                promise[i].then(v => {
                    arr[i] = v
                    count++
                    if (count === promise.length) {
                        resolve(arr)
                    }
                }, p => { })
            }
        })
    }

    race(promises) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    resolve(v)
                }, p => {
                    reject()
                })
            }





        })




    }

}





//添加 reject 方法

/* 
!!!關於then方法
Promise.prototype.then = function (onResolved, onReject){return new Promise}
在實際調用時長的是這樣子> p.then((value)=>{},(presen)=>{})
實際上onResolved傳入的形參，是我自己在html中寫的函數，爾後會在新的Promise中判斷狀態，
並決定調用哪個形參，如果成功就調用onResolved。
而調用的時候的value也是形參，而後面運行的
let result=  onResolved(this.PromiseResult)
等同是value等於this.PromiseResult，最後看到的結果是resolve(result)的結果。 */

