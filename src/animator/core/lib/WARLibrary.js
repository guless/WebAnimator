/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/// @Copyright ~2016 ☜Samlv9☞ and other contributors
/// @MIT-LICENSE | 1.0.0 | http://apidev.guless.com/
/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
///                                              }|
///                                              }|
///                                              }|     　 へ　　　 ／|    
///      _______     _______         ______      }|      /　│　　 ／ ／
///     /  ___  |   |_   __ \      .' ____ '.    }|     │　Z ＿,＜　／　　 /`ヽ
///    |  (__ \_|     | |__) |     | (____) |    }|     │　　　　　ヽ　　 /　　〉
///     '.___`-.      |  __ /      '_.____. |    }|      Y　　　　　`　 /　　/
///    |`\____) |    _| |  \ \_    | \____| |    }|    ｲ●　､　●　　⊂⊃〈　　/
///    |_______.'   |____| |___|    \______,'    }|    ()　 v　　　　|　＼〈
///    |=========================================\|    　>ｰ ､_　 ィ　 │ ／／
///    |> LESS IS MORE                           ||     / へ　　 /　ﾉ＜|＼＼
///    `=========================================/|    ヽ_ﾉ　　(_／　 │／／
///                                              }|     7　　　　　　  |／
///                                              }|     ＞―r￣￣`ｰ―＿`
///                                              }|
///                                              }|
/// Permission is hereby granted, free of charge, to any person obtaining a copy
/// of this software and associated documentation files (the "Software"), to deal
/// in the Software without restriction, including without limitation the rights
/// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
/// copies of the Software, and to permit persons to whom the Software is
/// furnished to do so, subject to the following conditions:
///
/// The above copyright notice and this permission notice shall be included in all
/// copies or substantial portions of the Software.
///
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
/// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
/// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
/// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
/// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
/// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
/// THE SOFTWARE.
import WARSerializable from "../WARSerializable";
import { EOF } from "../../defs/EOF";
import * as ItemTypeCode from "../../defs/ItemTypeCode";
import WARBitmapItem from "./WARBitmapItem";

import atob   from "../../utils/atob";
import utf8   from "../../utils/utf8";
import deutf8 from "../../utils/deutf8";
import concat from "../../utils/concat";


export default class WARLibrary extends WARSerializable {
    constructor() {
        super();
        
        this.dataTree = {};
    }
    
    hasItem( name ) {
        return name in this.dataTree;
    }
    
    getItem( name ) {
        return this.dataTree[name] || null;
    }
    
    addItem( item ) {
        /// 该元件已经存在。
        if ( this.dataTree[item.name] ) {
            return;
        }
        
        this.dataTree[item.name] = item;
    }
    
    serialize() {
        var dataList = [];
        
        for ( var name in this.dataTree ) {
            var item   = this.dataTree[name];
            var bytes  = item.serialize();
            var keydef = utf8(item.name);
            var buffer = new ArrayBuffer(5);
            var viewer = new DataView(buffer);
            
            viewer.setUint32(0, bytes.length + 1 + keydef.length + EOF.length);
            viewer.setUint8 (4, item.type);
            
            dataList.push(new Uint8Array(buffer));
            dataList.push(keydef, EOF);
            dataList.push(bytes);
        }
        
        return concat(dataList);
    }
    
    deSerialize( bytes ) {
        while ( bytes.length > 0 ) {
            var viewer   = new DataView(bytes.buffer, bytes.byteOffset);
            var itemSize = 4 + viewer.getUint32(0); // 读取元件内容长度。
            var itemType = bytes[4]; // 读取元件类型。
            var content  = bytes.subarray(5, itemSize); // 元件数据。
            
            /// 获取元件名称。
            for ( var start = 0; content[start]; ++start );
            
            var keydef = deutf8(content.subarray(0, start)); // 忽略 EOF 结尾并解码 UTF-8 字符串。
            var item = null;
            
            switch( itemType ) {
                case ItemTypeCode.BITMAP :
                    item = new WARBitmapItem(keydef);
                    break;
                    
                case ItemTypeCode.FONT :
                    throw new Error("Font does not support.");
                
                case ItemTypeCode.GRAPHICS :
                    throw new Error("Scalable vector graphics does not support.");
                    
                case ItemTypeCode.SOUND :
                    throw new Error("Sound does not support.");
                
                default:
                    throw new Error("Unknow item type.");
            }
            
            item.deSerialize(content.subarray(start + 1));
            this.addItem(item);
            
            /// 跳转到下一个元件的数据区。
            bytes = bytes.subarray(itemSize);
        }
        
        return bytes.length;
    }
}