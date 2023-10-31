# Nest.js Validation Pipe 작동 원리
> [Nest.js Vaildation Pipe Code](https://github.com/nestjs/nest/blob/master/packages/common/pipes/validation.pipe.ts)   


---
## 작동 순서
1. ValidationPipe는 ValidatePipeOptions를 인자로 받아 각 내부 변수에 할당함
2. classValidator와 classTransformer에 대한 Package를 직접 지정하지 않은 경우 기본 값인 class-validator와 class-transformer를 불러와 패키지가 깔려있는지 확인함
3. transform을 실행
   1. ValidatePipeOptions에 정한 typedl 있다면 들어온 값의 타입을 변경
   2. 들어온 값에 metaType이 없고 type이 커스텀이거나, [String. boolean, Number, Array, Object, Buffer, Date]에 포함되거나 null, undefined일경우 변환이 활성화 살태라면 값을 원시 타입으로 바꾸거나 아니라면 원래 value를 반환
   3. originalValue에 value를 할당함s
   4. value 가 null, undefined인지 확인하고 value에 있는 모든 __proto__를 제거함 
   5. classTransformer로 value를 원하는 타입으로 변경하고 이를 entity 변수에 저장함
   6. originalEntity 변수에 entity를 저장함
   7. entity.constructor가 metatype과 같은지 확인하고 같지 않다면
      1. 이와 동시에 value값이 원시값이 아닐경우 entity.constructor를 metatype으로 변경함
      2. entity를 { constructor: metatype } 형태로 변경함
   8. this.[validate](#validate)를 사용하여 entity를 검증함
      1. 검증된 오류가 있다면 [createExceptionFactory](#createexceptionfactory)를 사용하여 오류를 생성함
      2. 오류를 반환함
   9. value가 원시 값일경우 entity를 originalEntity로 변경함
   10. transfrom이 활성화 되있을경우 entity를 반환함
   11. value가 undefined, null일경우 originalValue를 반환함
   12. validatorOptions의 키의 길이가 1보다 클경우
       1.  맞을경우 entity를 classTransformer를 사용하여 classToPlain으로 변환하고 반환
       2.  아닐경우 value를 반환

---
## Funtions
### createExceptionFactory
```js
public createExceptionFactory() {
  return (validationErrors: ValidationError[] = []) => {
    if (this.isDetailedOutputDisabled) {
      return new HttpErrorByCode[this.errorHttpStatusCode]();
    }
    const errors = this.flattenValidationErrors(validationErrors);
    return new HttpErrorByCode[this.errorHttpStatusCode](errors);
  };
}
```
> ValidatorError를 받아서 "자세하게 오류 내용 표시"가 꺼져있다면 HTTP 상태 코드만 반환하고   
> 켜져있는 경우엔 오류를 평탄화 하는 작업을 진행한 후 HTTP 상태 코드와 함께 오류를 반환함 

### validate
```js
protected validate(
  object: object,
  validatorOptions?: ValidatorOptions,
): Promise<ValidationError[]> | ValidationError[] {
  return classValidator.validate(object, validatorOptions);
}
```
> classValidator를 통해 오류를 검증함
1. object와 validatorOptions를 받음
2. classValidator.validate를 통해 오류를 검증함
3. 검증된 오류를 반환함

### toEmptyIfNil
```js
protected toEmptyIfNil<T = any, R = any>(value: T): R | {} {
  return isNil(value) ? {} : value;
}
```
> 값이 null이거나 undefined인 경우 빈 객체를 반환함
1. value를 받음
2. value가 null이거나 undefined인 경우 빈 객체를 반환함
3. value가 null이거나 undefined가 아닌 경우 value를 반환함

### flattenValidationErrors
```js
protected flattenValidationErrors(
    validationErrors: ValidationError[],
  ): string[] {
    return iterate(validationErrors)
      .map(error => this.mapChildrenToValidationErrors(error))
      .flatten()
      .filter(item => !!item.constraints)
      .map(item => Object.values(item.constraints))
      .flatten()
      .toArray();
  }
```
> classValidator가 반환한 오류를 평탄화 하여 string[]으로 반환함
1. classValidator에서 반환한 에러중 children이 있는경우 평탄화를 진행하여 children 들을 부모와 합침 [mapChildrenToValidationErrors](#mapchildrentovalidationerrors)
2. 합처진 결과를 평탄화
3. 오류 내용이 없는 아이템을 제거함
4. 배열에서 Constraints의 값만 추출함
5. 추출한 결과를 평탄화
6. Array로 반환

<details>
<summary>변환 전 JSON</summary>
<pre>
[
  {
    property: 'username',
    constraints: {
      isNotEmpty: 'Username should not be empty',
    },
    children: [
      {
        property: 'firstName',
        constraints: {
          isNotEmpty: 'First name should not be empty',
        },
      },
      {
        property: 'lastName',
        constraints: {
          isNotEmpty: 'Last name should not be empty',
        },
      },
    ],
  },
  {
    property: 'email',
    constraints: {
      isEmail: 'Invalid email format',
    },
  },
  {
    property: 'password',
    constraints: {
      isNotEmpty: 'Password should not be empty',
      isLength: 'Password must be at least 8 characters long',
    },
  },
];
</pre>
</details>
<details>
<summary>변환 후 Array</summary>
<pre>
[
  'Username should not be empty',
  'First name should not be empty',
  'Last name should not be empty',
  'Invalid email format',
  'Password should not be empty',
  'Password must be at least 8 characters long',
]
</pre>
</details>

### mapChildrenToValidationErrors
```js
protected mapChildrenToValidationErrors(
  error: ValidationError,
  parentPath?: string,
): ValidationError[] {
  if (!(error.children && error.children.length)) {
    return [error];
  }
  const validationErrors = [];
  parentPath = parentPath
    ? `${parentPath}.${error.property}`
    : error.property;
  for (const item of error.children) {
    if (item.children && item.children.length) {
      validationErrors.push(
        ...this.mapChildrenToValidationErrors(item, parentPath),
      );
    }
    validationErrors.push(
      this.prependConstraintsWithParentProp(parentPath, item),
    );
  }
  return validationErrors;
}
```
> [flattenValidationErrors](#flattenvalidationerrors)에서 받은 단일 오류를 받아서 children을 부모 오류와 합치는 작업을 진행함
1. 오류 안에 children값이 없을경우 값을 반환함
2. validationErrors를 빈 배열로 선언함
3. parentPath가 존재할 경우 parentPath에 오류의 property를 붙임
4. 오류의 children을 순회하며 children이 존재할 경우 [mapChildrenToValidationErrors](#mapchildrentovalidationerrors)를 재귀적으로 호출하며 반환된 값을 validationErrors에 넣음
5. 값을 반환함
<!-- ```json
{
  "property": "username",
  "constraints": {
    "isNotEmpty": "Username should not be empty"
  },
  "children" [
    {
      "property": "firstName",
      "constraints" {
        "isNotEmpty": "First name should not be empty"
      }
    }
  ]
}
``` -->
### prependConstraintsWithParentProp
```js
protected prependConstraintsWithParentProp(
  parentPath: string,
  error: ValidationError,
): ValidationError {
  const constraints = {};
  for (const key in error.constraints) {
    constraints[key] = `${parentPath}.${error.constraints[key]}`;
  }
  return {
    ...error,
    constraints,
  };
}
```
> Constraints 안에 있는 메세지에 parentPath를 붙이는 작업을 진행함
1. parentPath와 error를 받음
2. error.constraints의 key값을 순회하며 parentPath를 붙임
3. 결과 값을 반환함

### stripProtoKeys
```js
protected stripProtoKeys(value: any) {
  if (
    value == null ||
    typeof value !== 'object' ||
    types.isTypedArray(value)
  ) {
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      this.stripProtoKeys(v);
    }
    return;
  }
  delete value.__proto__;
  for (const key in value) {
    this.stripProtoKeys(value[key]);
  }
}
```
> value의 __proto__를 제거함
1. value를 받음
2. value가 null이거나 undefined이거나 object가 아닌 경우 함수를 종료함
3. value가 배열인 경우 배열의 모든 요소에 stripProtoKeys를 호출함
4. value의 __proto__를 제거함
5. value의 모든 key에 stripProtoKeys를 호출함
6. 함수를 종료
