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
import WARCreator from "./animator/WARCreator";
import WARParser from "./animator/WARParser";
import * as CompressionFlags from "./animator/defs/CompressionFlags";
import * as BlockTypeCode  from "./animator/defs/BlockTypeCode";
import WARLibrary from "./animator/core/lib/WARLibrary";
import WARBitmapItem from "./animator/core/lib/WARBitmapItem";
console.time("WebAnimator Create");


var creator = new WARCreator();

creator.setCompression(CompressionFlags.DEFLATE);
creator.setMetadata(550, 400, 120, 60, 0xCCCCCC);
creator.writeHeader();

var lib = new WARLibrary();
lib.addItem(new WARBitmapItem("folder/angle.png", 675, 960, new Uint8Array([97, 98, 99, 100])));
lib.addItem(new WARBitmapItem("folder/bbc.png", 4675, 960, new Uint8Array([3, 4, 99, 7])));

creator.writeLibrary(lib);

var warfile = creator.flush();
console.log("file:", warfile);
console.timeEnd("WebAnimator Create");

/// ===========================================================================
/// 测试解码部分：
/// ===========================================================================
console.time("WebAnimator Parse");
var parser = new WARParser();

parser.addEventListener("metadata", ( evt ) => {
    var metadata = evt.metadata;
    console.log("metadata:", metadata);
});

parser.addEventListener("block", ( evt ) => {
    var type = evt.blockTypeCode;
    var content = evt.blockContent;
    
    if ( type == BlockTypeCode.LIBRARY ) {
        var lib = new WARLibrary();
        lib.deSerialize(content);
        console.log("library:", lib);
        return;
    }
    
    throw new Error("Unknow block type.");
});

parser.write(warfile);

console.timeEnd("WebAnimator Parse");