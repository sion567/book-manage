ng new book-manager --routing --style=scss --skip-tests

# 生成核心认证服务
ng g s core/auth/auth

# 生成登录和注册独立组件
ng g c features/auth/login
ng g c features/auth/register

# 生成图书管理组件
ng g c features/books/book-list


npm install --save-dev @types/jasmine


Angular Signals 官方架构建议
90% 的 HTTP 请求结果（分页数据）：建议放在 Component 中，使用 toSignal 接收。
用户登录/权限/全局配置：放在 Service 中。
表单输入/临时搜索词：放在 Component 中。 

Service 里的数据 (数据源)：
它是原始的、未触发的。fetchBooks() 返回的是一个 Observable（蓝图），它只是一段告诉程序“如何从服务器取钱”的代码。它不占内存空间，也没有存储当前的搜索结果。
Component 里的 Signal (状态)：
它是活动的、实时的。toSignal 是把那个“取钱的蓝图”变成了真正的“现金”并存在了组件里。它是状态（State），它代表了此时此刻用户在界面上看到的真实内容。


ervice 是单例的（长寿）：如果你在 Service 里存了 booksSignal，用户离开“图书列表”去了“个人中心”，那个信号依然占着内存。如果用户回退，可能先看到旧数据闪烁。
Component 是临时的（短寿）：放在组件里的 Signal 会随着页面关闭自动销毁。



假设有两个地方用到了图书列表：
dashboard显示的“最新图书”（只需要 5 条）。
图书管理显示的“全部图书”（分页，每页 20 条）。
如果数据存在 Service：它们会互相打架，因为 Service 里只有一个信号。
如果 Service 只提供 Observable（请求能力）：两个组件可以分别调用 fetchBooks(5) 和 fetchBooks(0, 20)，并各自在自己的组件里用 toSignal 持有独立的状态。



一个业务模块 = 一个 Service + 一个 Store + N 个 Component