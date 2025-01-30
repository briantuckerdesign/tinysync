import crypto from "crypto";

export const keys = {
    encrypt,
    decrypt,
};
function encrypt(text, password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), salt: salt.toString("hex"), encryptedData: encrypted.toString("hex") };
}

function decrypt(encrypted, password) {
    const iv = Buffer.from(encrypted.iv, "hex");
    const salt = Buffer.from(encrypted.salt, "hex");
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(Buffer.from(encrypted.encryptedData, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
