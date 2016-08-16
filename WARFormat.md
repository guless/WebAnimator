# Web Animator 动画格式数据文件规范

**当前版本：** 1.0.0
**最新版本：** 1.0.0
**更新日期：** 2016-08-16
**创建日期：** 2016-08-15

# Overview
```
                                                     .-----------.
                                                     | WAR files |
                                                     '-----------'
                                                           |
                                           .------------------------------.
                                           | Header | Block | ... | Block |
                                           '------------------------------'
                                          /                                \
.----------------------------------------.                                  .------------------------------.
| Leader  | C-Flags | Version | Metadata |                                  | Block Length | Block Content |
'----------------------------------------'                                  '------------------------------'
     |         |        |          |                                                 |            |
   "WAR"     0x00     1.0.0        |                                               123KB    [\x00 \x01 ... \x0n]
   (3bytes)  (1bytes) (6bytes)     /                                               (4bytes) (Equals to block's length)
                                  /                                                               /
        .----------------------------------------------------.                            (`decompress`)          
        | width | height | totalFrames | frameRate | bgColor |                                  | 
        '----------------------------------------------------'                        .---------------------.
            |        |          |            |          |                             | Library | Animation |
          550px    400px       120frames   60fps    0xABCDEF(RGB)                     '---------------------'
          (2bytes) (2bytes)    (2bytes)    (2bytes) (3bytes)                         
                                                                                    

.----------------------------------------------------------------------------------------------------------.
| Name          | Type       | Value             | Size(bytes) | Description                               |
|----------------------------------------------------------------------------------------------------------'
| Leader        | {String}   | "WAR"             | 3           | The `war` file leader characters, always equals to 'war'.
| C-Flags       | {Enum}     | NONE/DEFLATE/GZIP | 1           | The `Block Content` compression algorithms. defaults to `CompressionFlags.NONE`. 
| Version       | {Semver}   | "1.0.0"           | 6           | Semantic Versioning of current specifications. See: http://semver.org/
| width         | {UInt16}   | 550px             | 2           | Stage `width`.
| height        | {UInt16}   | 400px             | 2           | Stage `height`.
| totalFrames   | {UInt16}   | 120frames         | 2           | Stage `totalFrames`.
| frameRate     | {UInt16}   | 60fps             | 2           | Stage `frameRate`.
| bgColor       | {RGB}      | 0xABCDEF          | 3           | Stage `backgroundColor`.
| Block Length  | {UInt32}   | 12047bytes        | 4           | Defines the follow block size.
| Block Content | {Binary}   | [\x00...\xff]     | *           | Contains the animation raw data. Maybe compressed if `C-Flags` not `CompressionFlags.NONE`.
'-----------------------------------------------------------------------------------------------------------


```
    