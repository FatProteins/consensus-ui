export class KeyValuePair {
  key: string;
  value: string;
}

export class KeyValueWatch {
  changeLog?: string[];
}

export class KeyValueGet {
  pairs: KeyValuePair[];
}

export class KeyValueDelete {
  key: string;
}
