module BMA {
    export function ParseColorString(input: string) {

        var _hex2dec = function(v: string) {
            return parseInt(v, 16)
        }

        var _splitHEX = function(hex: string) {
            var c;
            if (hex.length === 4) {
                c = (hex.replace('#','')).split('');
                return {
                    r: _hex2dec((c[0] + c[0])),
                    g: _hex2dec((c[1] + c[1])),
                    b: _hex2dec((c[2] + c[2]))
                };
            } else {
                 return {
                    r: _hex2dec(hex.slice(1,3)),
                    g: _hex2dec(hex.slice(3,5)),
                    b: _hex2dec(hex.slice(5))
                };
            }
        }

        var _splitRGB = function(rgb: string) {
            var c = (rgb.slice(rgb.indexOf('(')+1, rgb.indexOf(')'))).split(',');
            var flag = false, obj;
            var c1 = c.map(function(n,i) {
                return (i !== 3) ? parseInt(n, 10) : flag = true, parseFloat(n);
            });
            obj = {
                r: c1[0],
                g: c1[1],
                b: c1[2]
            };
            if (flag) obj.a = c1[3];
            return obj;
        }

        var color = function(col) {
            var slc = col.slice(0,1);
            if (slc === '#') {
                return _splitHEX(col);
            } else if (slc.toLowerCase() === 'r') {
                return _splitRGB(col);
            } else {
                throw "not supported color format";
            }
        }

        return color(input);
    }
}