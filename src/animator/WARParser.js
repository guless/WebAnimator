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
import * as CompressionFlags from "./defs/CompressionFlags";
import * as BlockTypeCode    from "./defs/BlockTypeCode";
import * as ItemTypeCode     from "./defs/ItemTypeCode";
import * as FontTypeCode     from "./defs/FontTypeCode";

import Event from "../events/Event";
import EventDispatcher from "../events/EventDispatcher";

import WARMetadata from "./core/WARMetadata";
import WARParserMetaDataEvent from "./events/WARParserMetaDataEvent";
import WARBlockEvent from "./events/WARBlockEvent";

import concat from "./utils/concat";

var inflate = require("./zlib/inflate").inflate;
var ungzip = require("./zlib/inflate").ungzip;

const HEADER_SIZE = 10;
const METADATA_SIZE = 11;

export default class WARParser extends EventDispatcher {
    constructor() {
        super();
        
        this.dataList = [];
        this.length = 0;
        this.leader = "WAR";
        this.version = "1.0.0";
        this.semvers = [1, 0, 0];
        this.compression = CompressionFlags.NONE;
        this.metadata = null;
        this.isHeaderAvailable = false;
        this.isMetaDataAvailable = false;
    }
    
    write( bytes ) {
        this.dataList.push(bytes);
        this.length += bytes.length;
        
        if ( !(this.isHeaderAvailable) ) {
        if ( !(this.isHeaderAvailable = this.parseHeader()) ) { return; }}
        
        if ( !(this.isMetaDataAvailable) ) {
        if ( !(this.isMetaDataAvailable = this.parseMetaData()) ) { return; }}
        
        while( this.parseBlock() );
    }
    
    reflush() {
        var bytes = this.dataList.length == 1 ? this.dataList[0] : concat(this.dataList);
        this.dataList.length = 1;
        this.dataList[0] = bytes;
        return bytes;
    }
    
    truncate( bytes ) {
        this.dataList.length = +(!!bytes.length);
        this.dataList.length && (this.dataList[0] = bytes);
    }
    
    parseHeader() {
        /// 当前数据不足以解析文件头。
        if ( this.length < HEADER_SIZE ) { return false; }
        
        var bytes  = this.reflush();
        var viewer = new DataView(bytes.buffer, bytes.byteOffset);
        
        this.compression = bytes[3];
        
        var major = viewer.getUint16(4);
        var minor = viewer.getUint16(6);
        var build = viewer.getUint16(8);
        
        this.semvers = [major, minor, build];
        this.version = `${major}.${minor}.${build}`;
        
        this.length = bytes.length - HEADER_SIZE;
        this.truncate(bytes.subarray(HEADER_SIZE));
        return true;
    }
    
    parseMetaData() {
        /// 当前数据不足以解析元数据。
        if ( this.length < METADATA_SIZE ) { return false; }
        
        var bytes = this.reflush();
        
        this.metadata = new WARMetadata();
        var offset = this.metadata.deSerialize(bytes);
        
        this.length = bytes.length - METADATA_SIZE;
        this.truncate(bytes.subarray(offset));
        
        this.dispatchEvent(new WARParserMetaDataEvent("metadata", this.metadata, false, false));
        return true;
    }
    
    parseBlock() {
        /// 解析区块长度标识。
        if ( this.length > 4 ) {
            var bytes     = this.reflush();
            var viewer    = new DataView(bytes.buffer, bytes.byteOffset);
            var blockSize = 4 + viewer.getUint32(0);
            
            /// 数据长度不足解析当前区块：
            if ( this.length >= blockSize ) {
                var blockType = bytes[4];
                var blockContent = bytes.subarray(5, blockSize);
                
                if ( this.compression == CompressionFlags.DEFLATE ) {
                    blockContent = inflate(blockContent);
                }
                
                if ( this.compression == CompressionFlags.GZIP ) {
                    blockContent = ungzip(blockContent);
                }
                
                this.length = bytes.length - blockSize;
                this.truncate(bytes.subarray(blockSize));
                
                this.dispatchEvent(new WARBlockEvent("block", blockType, blockContent, false, false));
                return true;
            }
        }
        
        return false;
    }
}