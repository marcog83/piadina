"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertTestV1 = assertTestV1;
exports.assertTestV2 = assertTestV2;
exports.assertTestV3 = assertTestV3;
// Assert functions
function assertTestV1(input) {
    if (!input || typeof input !== 'object') {
        throw new Error('Input must be an object');
    }
    var obj = input;
    if (obj.version !== '1.0.0') {
        throw new Error('Expected version 1.0.0');
    }
    if (!obj.data || typeof obj.data !== 'object') {
        throw new Error('Data must be an object');
    }
    var data = obj.data;
    if (typeof data.name !== 'string') {
        throw new Error('Data.name must be a string');
    }
    if (typeof data.age !== 'number') {
        throw new Error('Data.age must be a number');
    }
}
function assertTestV2(input) {
    if (!input || typeof input !== 'object') {
        throw new Error('Input must be an object');
    }
    var obj = input;
    if (obj.version !== '2.0.0') {
        throw new Error('Expected version 2.0.0');
    }
    if (!obj.data || typeof obj.data !== 'object') {
        throw new Error('Data must be an object');
    }
    var data = obj.data;
    if (typeof data.fullName !== 'string') {
        throw new Error('Data.fullName must be a string');
    }
    if (typeof data.birthYear !== 'number') {
        throw new Error('Data.birthYear must be a number');
    }
}
function assertTestV3(input) {
    if (!input || typeof input !== 'object') {
        throw new Error('Input must be an object');
    }
    var obj = input;
    if (obj.version !== '3.0.0') {
        throw new Error('Expected version 3.0.0');
    }
    if (!obj.data || typeof obj.data !== 'object') {
        throw new Error('Data must be an object');
    }
    var data = obj.data;
    if (typeof data.name !== 'string') {
        throw new Error('Data.name must be a string');
    }
    if (typeof data.age !== 'number') {
        throw new Error('Data.age must be a number');
    }
    if (typeof data.isAdult !== 'boolean') {
        throw new Error('Data.isAdult must be a boolean');
    }
}
