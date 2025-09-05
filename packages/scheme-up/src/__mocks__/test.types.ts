interface TestV1Data {
  name: string;
  age: number;
}

interface TestV2Data {
  fullName: string;
  birthYear: number;
}

interface TestV3Data {
  name: string;
  age: number;
  isAdult: boolean;
}

export interface TestV1 { version: '1.0.0'; data: TestV1Data }
export interface TestV2 { version: '2.0.0'; data: TestV2Data }
export interface TestV3 { version: '3.0.0'; data: TestV3Data }
