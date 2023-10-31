# Nest.js Validation Pipe 작동 원리
> [Nest.js Vaildation Pipe Code](https://github.com/nestjs/nest/blob/master/packages/common/pipes/validation.pipe.ts)   


---
## 작동 순서
1. ValidationPipe는 ValidatePipeOptions를 인자로 받아 각 내부 변수에 할당함
2. classValidator와 classTransformer에 대한 Package를 직접 지정하지 않은 경우 기본 값인 class-validator와 class-transformer를 불러와 패키지가 깔려있는지 확인함
3. transform을 실행

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
