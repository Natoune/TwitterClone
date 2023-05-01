import Jwt from 'jsonwebtoken'

export function signJwt(data: any, expiresIn: any = undefined): any {
    let opt: any;
    if (expiresIn) {
        opt = {
            algorithm: 'HS256',
            expiresIn
        }
    } else {
        opt = {
            algorithm: 'HS256'
        }
    }

    return Jwt.sign(data, process.env.JWT_SECRET!, opt);
};

export function verifyJwt(token: string): any {
    return Jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) return {
            error: err
        };
        return decoded;
    });
}
