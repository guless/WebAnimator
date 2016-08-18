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
import WARMetadata from "./core/WARMetadata";

import atob   from "./utils/atob";
import utf8   from "./utils/utf8";
import concat from "./utils/concat";

var deflate = require("./zlib/deflate").deflate;
var gzip = require("./zlib/deflate").gzip;

const LEADER = 'WAR';
const VERSION = '1.0.0';

export default class WARCreator {
    constructor() {
        this.dataList = [];
        this.leader = LEADER;
        this.version = VERSION;
        this.compression = CompressionFlags.NONE;
        this.metadata = new WARMetadata();
    }
    
    setCompression( flags ) {
        this.compression = flags;
    }
    
    setMetadata( width = 0, height = 0, totalFrames = 0, frameRate = 20, bgColor = 0x000000 ) {
        this.metadata.update(width, height, totalFrames, frameRate, bgColor);
    }
    
    writeLeader() {
        this.dataList.push(utf8(this.leader));
    }
    
    writeCompression() {
        this.dataList.push(new Uint8Array([this.compression]));
    }
    
    writeSemver() {
        var semver = this.version.split(".");
        
        var major  = +(semver[0]);
        var minor  = +(semver[1]);
        var build  = +(semver[2]);
        
        var buffer = new ArrayBuffer(6);
        var viewer = new DataView(buffer);
        
        viewer.setUint16(0, major);
        viewer.setUint16(2, minor);
        viewer.setUint16(4, build);
        
        this.dataList.push(new Uint8Array(buffer));
    }
    
    writeMetadata() {
        this.dataList.push(this.metadata.serialize());
    }
    
    writeHeader() {
        this.writeLeader();
        this.writeCompression();
        this.writeSemver();
        this.writeMetadata();
    }
    
    writeBlock( bytes, code ) {
        var buffer = new ArrayBuffer(5);
        var viewer = new DataView(buffer);
        
        if ( this.compression == CompressionFlags.DEFLATE ) {
            bytes = deflate(bytes);
        }
        
        if ( this.compression == CompressionFlags.GZIP ) {
            bytes = gzip(bytes);
        }
        
        viewer.setUint32(0, bytes.length + 1);
        viewer.setUint8 (4, code);
        
        this.dataList.push(new Uint8Array(buffer));
        this.dataList.push(bytes);
    }
    
    writeLibrary( lib ) {
        this.writeBlock(lib.serialize(), BlockTypeCode.LIBRARY);
    }
    
    writeAnimation( ani ) {
        this.writeBlock(ani.serialize(), BlockTypeCode.ANIMATION);
    }
    
    flush() {
        var bytes = this.dataList.length == 1 ? this.dataList[0] : concat(this.dataList);
        this.dataList.length = 0;
        return bytes;
    }
}