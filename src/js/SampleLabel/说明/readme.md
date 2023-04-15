**SampleLabel类说明**
==============================
>### 功能：  
> 简单标签+样式 标记点
>
![](标记点.gif)  

### 接口
- 实例化
```javascript
let position = [121.92424498806614, 40.89661528946011, 12]
let p1 = new SampleLabel(viewer, [longitude,latitude,height], title);
```
参数说明：  
>- **viewer 主视图**
>- **[longitude,latitude,height] 经纬度坐标**
>- **title 标板上显示的文字**
- 聚焦
```javascript
p1.flyTo()
```
- 移除
```javascript
p1.remove()
```