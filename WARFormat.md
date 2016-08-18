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
.----------------------------------------.                                  .------------------------------------------------.
| Leader  | C-Flags | Version | Metadata |                                  | Block Length | Block Type Code | Block Content |
'----------------------------------------'                                  '------------------------------------------------'
     |         |        |          |                                                 |              |               |
   "WAR"     0x00     1.0.0        |                                               123KB          0x80       [\x00 ... \x0n]
   (3bytes)  (1bytes) (6bytes)     /                                               (4bytes)       (1bytes)      (*bytes)
                                  /                                                                                /
        .----------------------------------------------------.                                                    /         
        | width | height | totalFrames | frameRate | bgColor |                                              (decompress) 
        '----------------------------------------------------'                                                   |  
            |        |          |            |          |                                                        v
          550px    400px       120frames   60fps    0xABCDEF(RGB)                                      .---------------------.
          (2bytes) (2bytes)    (2bytes)    (2bytes) (3bytes)                                           | Library | Animation |
                                                                                                       '---------------------'
                                                                                                      /
               .--------------.                                                                      /
               | Library Item |>= = = = = = = = = = = = = = = = = ==.                               /
               '--------------'                                     |                              /
                     /                                              |                             /
             .----------------.                                 (Inherit)                        /
             | Item Name | \0 | (EOF)                               |                   .- - - -'
             '----------------'                                     |                  /
                   |                                                v                 /  
                 "ABC"                                  - - - - - - - - - - - --     /             
                 (*bytes)                              /            |           \   /  
                                                      /             |            \ /  
                      .-----------------------------------------------------------.
                      | Item Length | Item Type Code | Bitmaps / Fonts / Graphics |
                      '-----------------------------------------------------------'
                                            |           /          |         \ _ _ _ _ _ _ _ _ _
                                           0x90        /   .--------------------------------.   \
                                          (1bytes)    /    | + | Font Type Code | {RawData} |    \
                                                     /     '--------------------------------'     \
                                   .----------------------.            |              |            \
                                   | + | Size | {RawData} |          0xa0         [\x00 ... \x0n]   \
                                   '----------------------'          (1bytes)     (*bytes)           \
                                        /           |                                                 \
                      .----------------.        [\x00 ... \x0n]                     .---------------------------------------------------.
                      | width | height |        (*bytes)                            | + | Fill? / Stroke? | Scalable Graphics Path | \0 | (EOF)
                      '----------------'                                            '---------------------------------------------------'
                          |        |                                                                                    |
                        100px    100px                                                                                "M0 0L100 100Z"
                        (2bytes) (2bytes)                                                                             (*bytes)
                                  
                               
.----------------------------------------------------------------------------------------------------------------.
| Name            | Type       | Value                 | Size(bytes) | Description                               |
|----------------------------------------------------------------------------------------------------------------'
| Leader          | {String}   | "WAR"                 | 3           | The `war` file leader characters, always equals to 'war'.
| C-Flags         | {Enum}     | NONE/DEFLATE/GZIP     | 1           | The `Block Content` compression algorithms. defaults to `CompressionFlags.NONE`. 
| Version         | {Semver}   | "1.0.0"               | 6           | Semantic Versioning of current specifications. See: http://semver.org/
| width           | {UInt16}   | 550px                 | 2           | Stage `width`.
| height          | {UInt16}   | 400px                 | 2           | Stage `height`.
| totalFrames     | {UInt16}   | 120frames             | 2           | Stage `totalFrames`.
| frameRate       | {UInt16}   | 60fps                 | 2           | Stage `frameRate`.
| bgColor         | {RGB}      | 0xABCDEF              | 3           | Stage `backgroundColor`.
| Block Length    | {UInt32}   | 12047bytes            | 4           | Defines the follow block size.
| Block Type Code | {Enum}     | LIBRARY/ANIMATION     | 1           | Defines the type code of block.
| Block Content   | {RawData}  | [\x00...\xff]         | *           | Contains the animation raw data. Maybe compressed if `C-Flags` not `CompressionFlags.NONE`.
| Item Type Code  | {Enum}     | BITMAP/FONT/GRAPHICS  | 1           | Defines the type code of libary item.
| Item Name       | {String}   | "Symbol_001"          | *           | UTF-8 String with `EOF`.
| Font Type Code  | {Enum}     | TTF/SVG/WOFF          | 1           | Defines the file format type code of font.
'---------------------------------------------------------------------------------------------------------------

**CompressionFlags:**
.-----------------------------------------------.
| Code | Constants                              |
|-----------------------------------------------'
| 0x00 | CompressionFlags.NONE
| 0x01 | CompressionFlags.DEFLATE
| 0x02 | CompressionFlags.GZIP
'------------------------------------------------

**Block Type Code:**
.-----------------------------------------------.
| Code | Constants                              |
|-----------------------------------------------'
| 0x80 | BlockTypeCode.LIBRARY
| 0x81 | BlockTypeCode.ANIMATION
'------------------------------------------------

**Item Type Code:**
.-----------------------------------------------.
| Code | Constants                              |
|-----------------------------------------------'
| 0x90 | ItemTypeCode.BITMAP
| 0x91 | ItemTypeCode.FONT
| 0x92 | ItemTypeCode.GRAPHICS
'------------------------------------------------

**Font Type Code:**
.-----------------------------------------------.
| Code | Constants                              |
|-----------------------------------------------'
| 0xa0 | FontTypeCode.TTF
| 0xa1 | FontTypeCode.SVG
| 0xa2 | FontTypeCode.WOFF
'------------------------------------------------
```
    