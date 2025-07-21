# Store Test Coverage Documentation

This document explains the test strategy and coverage for the Pinia stores in the Territory Pro application.

## Test Files Overview

### 1. `search.test.ts` - Search Store Unit Tests

**Purpose**: Validates the search and filtering functionality that operates on customer data.

**Key Test Categories**:

- **Text Search**: Validates search across account names, customer numbers, sales reps, and addresses
- **Territory Filtering**: Ensures proper filtering by geographic territories
- **Sales Rep Filtering**: Tests filtering by sales representative
- **Q3 Promo Target Filtering**: Validates filtering by promotional target status
- **Sales Range Filters**: Tests minimum/maximum sales amount filtering
- **Combined Filters**: Verifies multiple simultaneous filters work correctly
- **Filter Management**: Tests adding, removing, and clearing filters
- **Edge Cases**: Handles empty data, special characters, and boundary conditions

**Critical Business Logic Tested**:

- Case-insensitive search functionality
- Partial match capabilities
- Filter combination logic (AND operations)
- Performance with large datasets (1000+ customers)

### 2. `territory.test.ts` - Territory Store Unit Tests

**Purpose**: Validates core data management, CSV loading, and computed territory analytics.

**Key Test Categories**:

- **Data Grouping**: Validates customers grouped by territory and sales rep
- **Statistics Computation**: Tests territory stats (customer count, sales totals, top products)
- **CSV Loading**: Tests successful parsing, error handling, loading states
- **LocalStorage Integration**: Validates data persistence and corruption handling
- **Data Integrity**: Ensures referential integrity between computed properties
- **Edge Cases**: Handles null values, missing data, concurrent operations
- **Performance**: Tests with large datasets and memory management

**Critical Business Logic Tested**:

- Territory assignment accuracy
- Sales aggregation calculations
- Q3 promo target counting
- Top product determination by sales volume
- Error recovery and state management

### 3. `integration.test.ts` - Cross-Store Integration Tests

**Purpose**: Validates that territory and search stores work together correctly in real-world scenarios.

**Key Test Categories**:

- **Data Synchronization**: Ensures search sees territory data changes immediately
- **CSV Loading Integration**: Tests search behavior during and after data loading
- **Computed Property Consistency**: Verifies territory stats match filtered search results
- **Real-time Reactivity**: Tests rapid filter changes and performance
- **Error Scenarios**: Validates graceful handling of cross-store errors
- **State Persistence**: Tests localStorage coordination between stores

**Critical Business Workflows Tested**:

- User loads CSV → applies search filters → views results
- Data reload while filters active → filters persist and apply to new data
- Concurrent operations don't corrupt state
- Error in one store doesn't break the other

## Test Data Strategy

### Mock Customer Data

Tests use realistic customer data representing different scenarios:

- **Geographic Distribution**: Customers across all 6 Colorado territories
- **Sales Variation**: Range from $1,050 to $4,860 in total sales
- **Product Mix**: Different combinations of DAXXIFY, RHA, and SkinPen sales
- **Q3 Promo Targets**: Mix of promotional target and non-target customers
- **Sales Rep Assignment**: Multiple reps with varying customer loads

### Edge Case Coverage

- **Empty Data**: Tests with no customers loaded
- **Null/Undefined Values**: Territory, sales rep, or sales data missing
- **Corrupted Data**: Invalid localStorage JSON, missing required fields
- **Large Datasets**: 1000+ customers for performance validation
- **Concurrent Operations**: Multiple CSV loads, rapid filter changes

## Performance Requirements

### Response Time Expectations

- **Search Operations**: < 50ms for datasets up to 1000 customers
- **Territory Computations**: < 100ms for large datasets with complex aggregations
- **Filter Application**: < 10ms for typical filter combinations
- **CSV Loading**: Varies by data size, but UI should remain responsive

### Memory Management

- **No Memory Leaks**: Multiple CSV loads don't accumulate memory
- **Efficient Reactivity**: Vue's computed properties only recalculate when dependencies change
- **LocalStorage Limits**: Graceful handling of storage quota exceeded

## Business Logic Validation

### Search Accuracy

- Text search matches partial strings across multiple fields
- Filters combine with AND logic (all conditions must match)
- Case-insensitive matching for user-friendly search
- Special characters in customer names don't break search

### Territory Analytics

- Customer counts match actual customer assignments
- Sales totals accurately sum all product sales by period
- Q3 promo target counts reflect actual customer status
- Top product determination uses total sales across all periods

### Data Integrity

- Customers appear in exactly one territory
- Sales rep assignments are consistent across all views
- Territory stats always match the underlying customer data
- Search results are always a subset of total customers

## Error Handling Coverage

### User-Facing Errors

- **Invalid CSV Format**: Clear error messages, no app crash
- **Network Failures**: Graceful degradation, retry capability
- **Storage Corruption**: Automatic recovery, user notification

### System Resilience

- **Concurrent Operations**: Last operation wins, no data corruption
- **Partial Data**: Missing fields don't crash computations
- **Memory Pressure**: Large datasets don't freeze the UI

## Future Test Enhancements

### Component Integration Tests

- Test Vue components that use these stores
- Validate UI updates when store data changes
- Test user interaction workflows end-to-end

### API Integration Tests

- Test real CSV file parsing with actual customer data
- Validate external data source integration
- Test offline/online mode transitions

### Accessibility Tests

- Screen reader compatibility with search results
- Keyboard navigation through filtered customer lists
- Color contrast in territory visualizations

This comprehensive test suite ensures the application handles real-world usage patterns, edge cases, and performance requirements while maintaining data integrity and user experience quality.
