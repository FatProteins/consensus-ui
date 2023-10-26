export class KeyValuePair {
  key: string;
  value: string;
}

export class KeyValueGet {
  pairs: KeyValuePair[];
  changeLog?: string[];
}

export class KeyValueDelete {
  key: string;
}
