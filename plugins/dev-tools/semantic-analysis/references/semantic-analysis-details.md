# Semantic Analysis 詳細リファレンス

## Core Evaluation Areas

### 1. API Contract Integrity

Assess the impact and completeness of API changes:

#### Evaluation Guidelines

**⭐⭐⭐⭐⭐ (5/5) Excellent**:

- Complete API change impact analysis
- No breaking changes
- All consumers updated
- Clear migration paths

**⭐⭐⭐⭐☆ (4/5) Good**:

- API changes properly managed
- Clear migration path
- Most consumers updated
- Minor coordination needed

**⭐⭐⭐☆☆ (3/5) Standard**:

- Basic API compatibility maintained
- Some unclear changes
- Partial consumer updates
- Improvements needed

**⭐⭐☆☆☆ (2/5) Needs Attention**:

- Breaking changes present
- Documented but incomplete
- Consumer impact unclear
- Coordination required

**⭐☆☆☆☆ (1/5) Critical**:

- Unverified breaking changes
- No impact analysis
- Consumer breakage likely
- Immediate review needed

#### Checklist

- [ ] All public API signature changes tracked
- [ ] All references updated for changes
- [ ] Deprecation process properly implemented
- [ ] Versioning strategy clear

#### Serena-Based Verification

```python
# API change impact analysis
changed_apis = find_symbol(name_path="public_methods", include_kinds=[6, 12])
for api in changed_apis:
    refs = find_referencing_symbols(name_path=api.name, relative_path=api.file)
    verify_all_references_updated(refs)
```

### 2. Architectural Boundary Compliance

Evaluate adherence to architectural layer boundaries:

#### Evaluation Guidelines

**⭐⭐⭐⭐⭐ (5/5) Excellent**:

- All dependencies flow correctly
- Layer boundaries perfectly maintained
- Zero architectural violations
- Clean separation of concerns

**⭐⭐⭐⭐☆ (4/5) Good**:

- Minor boundary violations with justification
- Generally good layer separation
- Intentional exceptions documented
- Strong architectural discipline

**⭐⭐⭐☆☆ (3/5) Standard**:

- Basic layer structure maintained
- Some inappropriate dependencies
- Several violations present
- Refactoring recommended

**⭐⭐☆☆☆ (2/5) Needs Improvement**:

- Multiple layer boundary violations
- Functions but maintainability compromised
- Significant refactoring needed
- Architectural review required

**⭐☆☆☆☆ (1/5) Critical**:

- Severe architectural violations
- Maintainability severely compromised
- Extensive restructuring required
- Fundamental design flaws

#### Checklist

- [ ] Controller → Service → Repository direction maintained
- [ ] Domain layer has no external dependencies
- [ ] No circular dependencies exist
- [ ] Interface Segregation Principle followed

#### Serena-Based Verification

```python
# Layer dependency checking
controllers = find_symbol(name_path="*Controller", substring_matching=True)
for controller in controllers:
    deps = analyze_dependencies(controller)
    ensure_no_direct_repository_access(deps)
```

### 3. Symbol Naming Consistency

Assess naming convention adherence across codebase:

#### Evaluation Guidelines

**⭐⭐⭐⭐⭐ (5/5) Excellent**:

- Complete naming convention consistency
- All symbols follow project standards
- Clear naming patterns
- Excellent discoverability

**⭐⭐⭐⭐☆ (4/5) Good**:

- 90%+ convention compliance
- Minor inconsistencies only
- Generally clear patterns
- Good discoverability

**⭐⭐⭐☆☆ (3/5) Standard**:

- Main conventions followed
- Some inconsistencies present
- Adequate clarity
- Room for improvement

**⭐⭐☆☆☆ (2/5) Needs Improvement**:

- Inconsistent naming
- Understandable but confusing
- Multiple pattern violations
- Refactoring recommended

**⭐☆☆☆☆ (1/5) Critical**:

- Naming causes confusion
- Hinders code comprehension
- Major consistency issues
- Comprehensive renaming needed

#### Checklist

- [ ] Class names use PascalCase
- [ ] Method names start with verbs
- [ ] Similar functions use same naming pattern
- [ ] Abbreviations used consistently

#### Serena-Based Verification

```python
# Naming pattern consistency check
services = search_for_pattern(substring_pattern=".*Service$")
verify_naming_pattern(services, pattern="PascalCase")

methods = find_symbol(include_kinds=[6])
verify_method_naming_convention(methods)
```

### 4. Interface Implementation Completeness

Verify complete and correct interface implementations:

#### Evaluation Guidelines

**⭐⭐⭐⭐⭐ (5/5) Excellent**:

- All interfaces fully implemented
- Contracts properly honored
- Comprehensive coverage
- Perfect compliance

**⭐⭐⭐⭐☆ (4/5) Good**:

- Complete implementation
- Some performance improvements possible
- Good contract adherence
- Minor optimization opportunities

**⭐⭐⭐☆☆ (3/5) Standard**:

- Required methods implemented
- Optional features missing
- Basic compliance
- Enhancement opportunities

**⭐⭐☆☆☆ (2/5) Needs Improvement**:

- Basic implementation present
- Edge cases unconsidered
- Incomplete coverage
- Significant gaps

**⭐☆☆☆☆ (1/5) Critical**:

- Contract violations present
- Missing implementations
- Broken contracts
- Immediate fixes required

#### Checklist

- [ ] All interface methods implemented
- [ ] Implementation matches interface intent
- [ ] Error handling appropriate
- [ ] Performance requirements met

#### Serena-Based Verification

```python
# Interface implementation verification
interfaces = find_symbol(include_kinds=[11])  # Interface
for interface in interfaces:
    implementations = find_symbol(
        name_path=f"implements {interface.name}",
        include_kinds=[5]  # Class
    )
    verify_all_methods_implemented(interface, implementations)
```

### 5. Dependency Health Score

Evaluate dependency complexity and maintainability:

#### Evaluation Guidelines

**⭐⭐⭐⭐⭐ (5/5) Excellent**:

- Minimal, purposeful dependencies
- Clear dependency purposes
- No coupling issues
- Highly maintainable

**⭐⭐⭐⭐☆ (4/5) Good**:

- Appropriate dependencies
- Some optimization opportunities
- Generally healthy
- Minor improvements possible

**⭐⭐⭐☆☆ (3/5) Standard**:

- Necessary dependencies
- Somewhat complex
- Manageable
- Room for simplification

**⭐⭐☆☆☆ (2/5) Needs Improvement**:

- Excessive dependencies
- Increasing complexity
- Coupling concerns
- Refactoring recommended

**⭐☆☆☆☆ (1/5) Critical**:

- Tangled dependencies
- Maintenance difficulty
- High coupling
- Major restructuring needed

#### Checklist

- [ ] Each module has appropriate dependency count (guideline: ≤5)
- [ ] No bidirectional dependencies
- [ ] Dependencies explicitly declared
- [ ] No unnecessary dependencies

#### Serena-Based Verification

```python
# Dependency health check
modules = get_symbols_overview("src/")
for module in modules:
    deps = calculate_dependencies(module)
    score = calculate_dependency_health_score(deps)
    report_excessive_dependencies(module, deps)
```

### 6. Test Coverage for Changed Symbols

Verify comprehensive test coverage for modified code:

#### Evaluation Guidelines

**⭐⭐⭐⭐⭐ (5/5) Excellent**:

- Comprehensive tests for all changes
- Complete edge case coverage
- Error scenarios tested
- Performance tests where needed

**⭐⭐⭐⭐☆ (4/5) Good**:

- Good test coverage for changes
- Main scenarios covered
- Some edge cases missing
- Generally well-tested

**⭐⭐⭐☆☆ (3/5) Standard**:

- Basic tests present
- Coverage gaps exist
- Happy path tested
- Edge cases need attention

**⭐⭐☆☆☆ (2/5) Needs Improvement**:

- Insufficient tests
- Critical functions untested
- Major coverage gaps
- Testing required

**⭐☆☆☆☆ (1/5) Critical**:

- Minimal or no tests for changes
- High risk of regression
- Immediate testing needed
- Unacceptable coverage

#### Checklist

- [ ] Each changed method has tests
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] Performance tests where applicable

#### Serena-Based Verification

```python
# Changed symbol test coverage verification
changed_symbols = get_changed_symbols()
for symbol in changed_symbols:
    test_refs = find_referencing_symbols(
        name_path=symbol.name,
        relative_path=symbol.file,
        include_kinds=[12]  # Functions (tests)
    )
    assess_test_coverage(symbol, test_refs)
```

## Semantic Analysis Report Template

When performing semantic analysis, structure findings as follows:

```markdown
## 🔍 Semantic Analysis Report

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### API Impact Analysis

- **Changed APIs**: [count]
- **Affected Files**: [count]
- **Breaking Changes**: [list]
- **Migration Required**: Yes/No

### Architectural Compliance

- **Layer Violations**: [count]
- **Circular Dependencies**: [count]
- **Clean Architecture Score**: [X/5]

### Symbol Quality

- **Naming Consistency**: [X%]
- **Interface Compliance**: [X%]
- **Documentation Coverage**: [X%]

### Dependency Health

- **Average Dependencies per Module**: [X]
- **Max Dependency Depth**: [X]
- **Circular References**: [count]

### Test Impact

- **Tests Affected**: [count]
- **New Tests Required**: [count]
- **Coverage Delta**: [+/-X%]
```

## Analysis Workflows

### API Change Impact Analysis

1. **Identify changed symbols**: Use `find_symbol` to locate modifications
2. **Find all references**: Use `find_referencing_symbols` for each changed API
3. **Assess impact**: Categorize as breaking or compatible
4. **Verify updates**: Ensure all consumers handle changes
5. **Document migration**: Provide clear upgrade path

### Architectural Boundary Verification

1. **Map layer structure**: Identify architectural layers
2. **Trace dependencies**: Use Serena to follow dependency chains
3. **Detect violations**: Identify improper layer crossing
4. **Assess severity**: Categorize architectural issues
5. **Recommend fixes**: Suggest refactoring to restore boundaries

### Symbol Consistency Check

1. **Scan naming patterns**: Use `search_for_pattern` for conventions
2. **Identify deviations**: Find inconsistent naming
3. **Categorize issues**: Group by naming convention type
4. **Suggest renames**: Provide consistent alternatives
5. **Assess impact**: Consider refactoring scope

## Best Practices

### Early API Change Detection

- Analyze API changes at PR creation time
- Automate impact analysis in CI/CD
- Document breaking changes proactively

### Automated Dependency Checking

- Integrate semantic analysis in CI/CD pipeline
- Set dependency complexity thresholds
- Alert on architectural violations

### Incremental Analysis

- Analyze large changes in stages
- Focus on high-impact areas first
- Iteratively improve code structure

### Team Collaboration

- Share semantic analysis results with team
- Document architectural decisions
- Maintain living architecture documentation

## 🤖 Agent Integration

このスキルは高度なコード解析タスクを実行するエージェントに専門知識を提供します:

### Researcher Agent（特に重要）

- **提供内容**: Serena MCP統合、シンボルレベル解析、依存関係追跡
- **タイミング**: 深い調査・影響範囲分析・アーキテクチャ検証時
- **コンテキスト**:
  - API契約整合性分析（get_symbols_overview, find_symbol）
  - Breaking change検出（find_referencing_symbols）
  - アーキテクチャ境界検証（依存方向チェック）
  - 依存関係ヘルス評価

### Code-Reviewer Agent

- **提供内容**: セマンティックレベルの品質評価、影響分析統合
- **タイミング**: 包括的レビュー実行時（`/review --with-impact`）
- **コンテキスト**: API変更影響レポート、Breaking change警告、アーキテクチャ違反検出

### Orchestrator Agent

- **提供内容**: リファクタリング影響範囲の把握、段階的変更計画
- **タイミング**: 大規模リファクタリング実行時
- **コンテキスト**: 影響範囲特定、変更順序決定、リスク評価

### 自動ロード条件

- "semantic analysis"、"影響分析"、"API変更"に言及
- "依存関係"、"Breaking change"、"アーキテクチャ検証"に言及
- `/review --with-impact`、`--deep-analysis`オプション使用時
- 大規模リファクタリングタスク時

**統合例**:

```
ユーザー: "/review --with-impact"
    ↓
TaskContext作成
    ↓
プロジェクト検出: TypeScript + React
    ↓
スキル自動ロード: code-review, semantic-analysis, typescript, react
    ↓
エージェント選択: code-reviewer (with Serena integration)
    ↓ (スキルコンテキスト提供)
通常レビュー + Serena深度解析（API影響、Breaking change検出）
    ↓
実行完了（⭐️評価 + 影響分析レポート）
```

## Integration with Related Skills

- **clean-architecture skill**: For architectural pattern validation
- **golang skill**: For Go-specific semantic patterns
- **typescript skill**: For TypeScript semantic analysis
- **react skill**: For React component dependency analysis

## Usage Examples

```bash
# Basic semantic analysis
/task "Perform semantic analysis on this PR"

# API change impact analysis
/task "Analyze the impact of API changes in UserService"

# Architectural boundary verification
/task "Check for Clean Architecture violations"

# Full semantic review
/task "Run complete semantic analysis including API changes, dependencies, and test coverage"
```

This semantic analysis skill enables deep structural understanding beyond surface-level code review, ensuring long-term codebase health and maintainability.
