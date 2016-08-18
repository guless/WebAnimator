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
import WARSerializable from "./WARSerializable";


export default class WARMetadata extends WARSerializable {
    constructor( width = 0, height = 0, totalFrames = 0, frameRate = 20, bgColor = 0x000000 ) {
        super();
        
        this.width = width;
        this.height = height;
        this.totalFrames = totalFrames;
        this.frameRate = frameRate;
        this.bgColor = bgColor;
    }
    
    update( width = 0, height = 0, totalFrames = 0, frameRate = 20, bgColor ) {
        this.width = width;
        this.height = height;
        this.totalFrames = totalFrames;
        this.frameRate = frameRate;
        this.bgColor = bgColor;
    }
    
    serialize() {
        var buffer = new ArrayBuffer(11);
        var viewer = new DataView(buffer);
        
        viewer.setUint16(0, this.width);
        viewer.setUint16(2, this.height);
        viewer.setUint16(4, this.totalFrames);
        viewer.setUint16(6, this.frameRate);
        
        var r = this.bgColor >>> 16 & 0xFF;
        var g = this.bgColor >>> 8  & 0xFF;
        var b = this.bgColor & 0xFF;
        
        viewer.setUint8( 8, r);
        viewer.setUint8( 9, g);
        viewer.setUint8(10, b);
        
        return new Uint8Array(buffer);
    }
    
    deSerialize( bytes ) {
        var viewer = new DataView(bytes.buffer, bytes.byteOffset);
        
        this.width = viewer.getUint16(0);
        this.height = viewer.getUint16(2);
        this.totalFrames = viewer.getUint16(4);
        this.frameRate = viewer.getUint16(6);
        
        var r = viewer.getUint8( 8);
        var g = viewer.getUint8( 9);
        var b = viewer.getUint8(10);
        
        this.bgColor = (r << 16 | g << 8 | b);
        return 11;
    }
}