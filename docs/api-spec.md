# ProTipp V2 – API Specifikáció (v1.0)

## Áttekintés

A ProTipp V2 API egy REST-alapú szolgáltatás, amely valós idejű sports betting odds adatokat és arbitrage lehetőségeket biztosít. Az API Supabase JWT autentikációt használ és előfizetés-alapú hozzáférési szinteket támogat.

**Base URL**: `https://api.protipp.com/v1`  
**API Version**: 1.0  
**Authentication**: Bearer Token (Supabase JWT)  
**Rate Limiting**: Tier-based (Free/Basic/Pro)

---

## OpenAPI 3.0 Specifikáció

```yaml
openapi: 3.0.3
info:
  title: ProTipp V2 API
  description: Sports betting arbitrage platform API
  version: 1.0.0
  contact:
    name: ProTipp Support
    email: support@protipp.com
  license:
    name: Proprietary
servers:
  - url: https://api.protipp.com/v1
    description: Production server
  - url: https://staging-api.protipp.com/v1
    description: Staging server

security:
  - BearerAuth: []
  - ApiKeyAuth: []

paths:
  # ===== SPORTS ENDPOINTS =====
  /sports:
    get:
      summary: Get available sports
      description: Returns list of available sports with their keys and active status
      tags: [Sports]
      security: []
      parameters:
        - name: active
          in: query
          description: Filter by active status
          schema:
            type: boolean
        - name: limit
          in: query
          description: Number of results to return
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 50
      responses:
        '200':
          description: List of sports
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Sport'
                  meta:
                    $ref: '#/components/schemas/Meta'
        '429':
          $ref: '#/components/responses/RateLimitError'

  # ===== ODDS ENDPOINTS =====
  /odds:
    get:
      summary: Get odds data
      description: Returns current odds for specified sport and markets
      tags: [Odds]
      security: []
      parameters:
        - name: sport
          in: query
          required: true
          description: Sport key (e.g., 'soccer_epl', 'basketball_nba')
          schema:
            type: string
        - name: market
          in: query
          description: Market type (h2h, spreads, totals)
          schema:
            type: string
            enum: [h2h, spreads, totals]
            default: h2h
        - name: region
          in: query
          description: Region for odds (us, uk, eu, au)
          schema:
            type: string
            enum: [us, uk, eu, au]
            default: us
        - name: limit
          in: query
          description: Number of results to return
          schema:
            type: integer
            minimum: 1
            maximum: 1000
            default: 100
        - name: offset
          in: query
          description: Number of results to skip
          schema:
            type: integer
            minimum: 0
            default: 0
      responses:
        '200':
          description: Odds data
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/OddsEvent'
                  meta:
                    $ref: '#/components/schemas/Meta'
        '400':
          $ref: '#/components/responses/ValidationError'
        '429':
          $ref: '#/components/responses/RateLimitError'

  # ===== ARBITRAGE ENDPOINTS =====
  /arbitrage:
    get:
      summary: Get arbitrage opportunities
      description: Returns current arbitrage opportunities with profit margins
      tags: [Arbitrage]
      parameters:
        - name: min_profit
          in: query
          description: Minimum profit margin percentage
          schema:
            type: number
            minimum: 0
            maximum: 100
            default: 1.0
        - name: market_type
          in: query
          description: Market type filter
          schema:
            type: string
            enum: [h2h, spreads, totals]
        - name: sport
          in: query
          description: Sport filter
          schema:
            type: string
        - name: limit
          in: query
          description: Number of results to return
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 50
        - name: expires_in
          in: query
          description: Filter by expiration time (minutes)
          schema:
            type: integer
            minimum: 1
            maximum: 60
            default: 30
      responses:
        '200':
          description: Arbitrage opportunities
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ArbitrageOpportunity'
                  meta:
                    $ref: '#/components/schemas/Meta'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '429':
          $ref: '#/components/responses/RateLimitError'

  # ===== EXPORT ENDPOINTS =====
  /export:
    get:
      summary: Export data
      description: Export odds or arbitrage data in CSV or JSON format
      tags: [Export]
      parameters:
        - name: format
          in: query
          required: true
          description: Export format
          schema:
            type: string
            enum: [csv, json]
        - name: type
          in: query
          required: true
          description: Data type to export
          schema:
            type: string
            enum: [odds, arbitrage]
        - name: sport
          in: query
          description: Sport filter
          schema:
            type: string
        - name: market
          in: query
          description: Market filter
          schema:
            type: string
        - name: from
          in: query
          description: Start date (ISO 8601)
          schema:
            type: string
            format: date-time
        - name: to
          in: query
          description: End date (ISO 8601)
          schema:
            type: string
            format: date-time
        - name: limit
          in: query
          description: Maximum number of records
          schema:
            type: integer
            minimum: 1
            maximum: 10000
            default: 1000
      responses:
        '200':
          description: Export data
          content:
            text/csv:
              schema:
                type: string
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '429':
          $ref: '#/components/responses/RateLimitError'

  # ===== USER ENDPOINTS =====
  /user/profile:
    get:
      summary: Get user profile
      description: Returns current user profile information
      tags: [User]
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    $ref: '#/components/schemas/UserProfile'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

    put:
      summary: Update user profile
      description: Update user profile information
      tags: [User]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserProfileUpdate'
      responses:
        '200':
          description: Updated user profile
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    $ref: '#/components/schemas/UserProfile'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  /user/betting-records:
    get:
      summary: Get user betting records
      description: Returns user's betting history
      tags: [User]
      parameters:
        - name: status
          in: query
          description: Filter by betting status
          schema:
            type: string
            enum: [pending, won, lost, cancelled]
        - name: limit
          in: query
          description: Number of results to return
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 50
        - name: offset
          in: query
          description: Number of results to skip
          schema:
            type: integer
            minimum: 0
            default: 0
      responses:
        '200':
          description: Betting records
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/BettingRecord'
                  meta:
                    $ref: '#/components/schemas/Meta'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

    post:
      summary: Create betting record
      description: Create a new betting record
      tags: [User]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BettingRecordCreate'
      responses:
        '201':
          description: Betting record created
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    $ref: '#/components/schemas/BettingRecord'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  # ===== ADMIN ENDPOINTS =====
  /admin/providers:
    get:
      summary: Get provider health status
      description: Returns health status and quota information for all providers
      tags: [Admin]
      security:
        - AdminAuth: []
      responses:
        '200':
          description: Provider health data
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ProviderHealth'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'

  /admin/providers/reload:
    post:
      summary: Reload provider configurations
      description: Reload all provider configurations and restart workers
      tags: [Admin]
      security:
        - AdminAuth: []
      responses:
        '200':
          description: Providers reloaded successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  message:
                    type: string
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'

  /admin/keys:
    get:
      summary: List API keys
      description: Returns list of all API keys with usage statistics
      tags: [Admin]
      security:
        - AdminAuth: []
      parameters:
        - name: user_id
          in: query
          description: Filter by user ID
          schema:
            type: string
        - name: active
          in: query
          description: Filter by active status
          schema:
            type: boolean
      responses:
        '200':
          description: API keys list
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ApiKey'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'

  /admin/keys/rotate:
    post:
      summary: Rotate API keys
      description: Rotate API keys for specified user or all users
      tags: [Admin]
      security:
        - AdminAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
                  description: User ID to rotate keys for (optional, rotates all if not provided)
                force:
                  type: boolean
                  description: Force rotation even if keys are recent
                  default: false
      responses:
        '200':
          description: Keys rotated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  message:
                    type: string
                  rotated_count:
                    type: integer
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'

  /admin/metrics:
    get:
      summary: Get system metrics
      description: Returns system performance metrics and statistics
      tags: [Admin]
      security:
        - AdminAuth: []
      parameters:
        - name: period
          in: query
          description: Time period for metrics
          schema:
            type: string
            enum: [1h, 24h, 7d, 30d]
            default: 24h
        - name: metric
          in: query
          description: Specific metric to retrieve
          schema:
            type: string
            enum: [latency, cache_hit, error_rate, quota_usage, throughput]
      responses:
        '200':
          description: System metrics
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    $ref: '#/components/schemas/SystemMetrics'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'

  /admin/audit:
    get:
      summary: Get audit logs
      description: Returns system audit logs for security and compliance
      tags: [Admin]
      security:
        - AdminAuth: []
      parameters:
        - name: action
          in: query
          description: Filter by action type
          schema:
            type: string
            enum: [login, logout, api_access, data_export, admin_action]
        - name: user_id
          in: query
          description: Filter by user ID
          schema:
            type: string
        - name: from
          in: query
          description: Start date (ISO 8601)
          schema:
            type: string
            format: date-time
        - name: to
          in: query
          description: End date (ISO 8601)
          schema:
            type: string
            format: date-time
        - name: limit
          in: query
          description: Number of results to return
          schema:
            type: integer
            minimum: 1
            maximum: 1000
            default: 100
      responses:
        '200':
          description: Audit logs
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/AuditLog'
                  meta:
                    $ref: '#/components/schemas/Meta'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Supabase JWT token
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for programmatic access
    AdminAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Admin JWT token with admin privileges

  schemas:
    # ===== CORE SCHEMAS =====
    Sport:
      type: object
      required: [key, title, active]
      properties:
        key:
          type: string
          description: Unique sport identifier
          example: "soccer_epl"
        title:
          type: string
          description: Human-readable sport name
          example: "English Premier League"
        active:
          type: boolean
          description: Whether the sport is currently active
          example: true
        description:
          type: string
          description: Sport description
          example: "English Premier League soccer matches"

    OddsEvent:
      type: object
      required: [id, sport_key, commence_time, home_team, away_team, bookmakers]
      properties:
        id:
          type: string
          description: Unique event identifier
          example: "evt_123456789"
        sport_key:
          type: string
          description: Sport identifier
          example: "soccer_epl"
        commence_time:
          type: string
          format: date-time
          description: Event start time
          example: "2025-01-15T15:00:00Z"
        home_team:
          type: string
          description: Home team name
          example: "Manchester United"
        away_team:
          type: string
          description: Away team name
          example: "Liverpool"
        bookmakers:
          type: array
          items:
            $ref: '#/components/schemas/BookmakerOdds'
          description: List of bookmaker odds for this event

    BookmakerOdds:
      type: object
      required: [key, title, markets]
      properties:
        key:
          type: string
          description: Bookmaker identifier
          example: "bet365"
        title:
          type: string
          description: Bookmaker name
          example: "Bet365"
        markets:
          type: array
          items:
            $ref: '#/components/schemas/Market'
          description: Available markets for this bookmaker

    Market:
      type: object
      required: [key, outcomes]
      properties:
        key:
          type: string
          description: Market type
          example: "h2h"
        outcomes:
          type: array
          items:
            $ref: '#/components/schemas/Outcome'
          description: Available outcomes for this market

    Outcome:
      type: object
      required: [name, price]
      properties:
        name:
          type: string
          description: Outcome name
          example: "Manchester United"
        price:
          type: number
          format: float
          description: Decimal odds
          example: 2.10
        point:
          type: number
          format: float
          description: Point spread (for spreads market)
          example: -1.5

    ArbitrageOpportunity:
      type: object
      required: [id, sport_key, event_id, profit_margin, expires_at, bookmaker_combinations]
      properties:
        id:
          type: string
          description: Unique opportunity identifier
          example: "arb_123456789"
        sport_key:
          type: string
          description: Sport identifier
          example: "soccer_epl"
        event_id:
          type: string
          description: Event identifier
          example: "evt_123456789"
        event_title:
          type: string
          description: Event title
          example: "Manchester United vs Liverpool"
        commence_time:
          type: string
          format: date-time
          description: Event start time
          example: "2025-01-15T15:00:00Z"
        market_type:
          type: string
          description: Market type
          example: "h2h"
        profit_margin:
          type: number
          format: float
          description: Profit margin percentage
          example: 5.2
        total_stake:
          type: number
          format: float
          description: Total stake amount
          example: 1000.0
        guaranteed_profit:
          type: number
          format: float
          description: Guaranteed profit amount
          example: 52.0
        expires_at:
          type: string
          format: date-time
          description: Opportunity expiration time
          example: "2025-01-15T14:45:00Z"
        bookmaker_combinations:
          type: array
          items:
            $ref: '#/components/schemas/BookmakerCombination'
          description: Bookmaker combinations for this opportunity

    BookmakerCombination:
      type: object
      required: [bookmaker_key, outcome, stake, return]
      properties:
        bookmaker_key:
          type: string
          description: Bookmaker identifier
          example: "bet365"
        bookmaker_title:
          type: string
          description: Bookmaker name
          example: "Bet365"
        outcome:
          type: string
          description: Outcome to bet on
          example: "Manchester United"
        stake:
          type: number
          format: float
          description: Stake amount for this bookmaker
          example: 476.19
        return:
          type: number
          format: float
          description: Expected return from this bet
          example: 1000.0

    # ===== USER SCHEMAS =====
    UserProfile:
      type: object
      required: [id, email, subscription_tier, created_at]
      properties:
        id:
          type: string
          description: User ID
          example: "user_123456789"
        email:
          type: string
          format: email
          description: User email address
          example: "user@example.com"
        subscription_tier:
          type: string
          enum: [free, basic, pro]
          description: User subscription tier
          example: "pro"
        subscription_expires_at:
          type: string
          format: date-time
          description: Subscription expiration time
          example: "2025-12-31T23:59:59Z"
        api_key:
          type: string
          description: User API key (if generated)
          example: "api_123456789abcdef"
        created_at:
          type: string
          format: date-time
          description: Account creation time
          example: "2025-01-01T00:00:00Z"
        last_login_at:
          type: string
          format: date-time
          description: Last login time
          example: "2025-01-11T10:30:00Z"
        usage_stats:
          $ref: '#/components/schemas/UsageStats'

    UserProfileUpdate:
      type: object
      properties:
        email:
          type: string
          format: email
          description: New email address
        subscription_tier:
          type: string
          enum: [free, basic, pro]
          description: New subscription tier

    UsageStats:
      type: object
      properties:
        api_calls_today:
          type: integer
          description: API calls made today
          example: 150
        api_calls_limit:
          type: integer
          description: Daily API call limit
          example: 1000
        exports_today:
          type: integer
          description: Data exports made today
          example: 5
        exports_limit:
          type: integer
          description: Daily export limit
          example: 10
        last_reset:
          type: string
          format: date-time
          description: Last usage reset time
          example: "2025-01-11T00:00:00Z"

    BettingRecord:
      type: object
      required: [id, user_id, opportunity_id, amount, status, created_at]
      properties:
        id:
          type: string
          description: Betting record ID
          example: "bet_123456789"
        user_id:
          type: string
          description: User ID
          example: "user_123456789"
        opportunity_id:
          type: string
          description: Arbitrage opportunity ID
          example: "arb_123456789"
        amount:
          type: number
          format: float
          description: Total stake amount
          example: 1000.0
        status:
          type: string
          enum: [pending, won, lost, cancelled]
          description: Betting status
          example: "pending"
        profit_loss:
          type: number
          format: float
          description: Profit or loss amount
          example: 52.0
        created_at:
          type: string
          format: date-time
          description: Record creation time
          example: "2025-01-11T10:30:00Z"
        updated_at:
          type: string
          format: date-time
          description: Last update time
          example: "2025-01-11T10:30:00Z"
        opportunity:
          $ref: '#/components/schemas/ArbitrageOpportunity'

    BettingRecordCreate:
      type: object
      required: [opportunity_id, amount]
      properties:
        opportunity_id:
          type: string
          description: Arbitrage opportunity ID
          example: "arb_123456789"
        amount:
          type: number
          format: float
          minimum: 1
          description: Total stake amount
          example: 1000.0

    # ===== ADMIN SCHEMAS =====
    ProviderHealth:
      type: object
      required: [key, title, status, quota_used, quota_limit]
      properties:
        key:
          type: string
          description: Provider identifier
          example: "the_odds_api"
        title:
          type: string
          description: Provider name
          example: "The Odds API"
        status:
          type: string
          enum: [healthy, degraded, down]
          description: Provider health status
          example: "healthy"
        quota_used:
          type: integer
          description: Quota used today
          example: 5000
        quota_limit:
          type: integer
          description: Daily quota limit
          example: 10000
        quota_reset_at:
          type: string
          format: date-time
          description: Quota reset time
          example: "2025-01-12T00:00:00Z"
        last_successful_request:
          type: string
          format: date-time
          description: Last successful request time
          example: "2025-01-11T10:29:00Z"
        average_response_time:
          type: number
          format: float
          description: Average response time in milliseconds
          example: 250.5
        error_rate:
          type: number
          format: float
          description: Error rate percentage
          example: 0.5

    ApiKey:
      type: object
      required: [id, user_id, key_prefix, created_at, last_used_at]
      properties:
        id:
          type: string
          description: API key ID
          example: "key_123456789"
        user_id:
          type: string
          description: User ID
          example: "user_123456789"
        key_prefix:
          type: string
          description: API key prefix (first 8 characters)
          example: "api_1234"
        created_at:
          type: string
          format: date-time
          description: Key creation time
          example: "2025-01-01T00:00:00Z"
        last_used_at:
          type: string
          format: date-time
          description: Last usage time
          example: "2025-01-11T10:30:00Z"
        usage_count:
          type: integer
          description: Total usage count
          example: 1500
        is_active:
          type: boolean
          description: Whether the key is active
          example: true

    SystemMetrics:
      type: object
      properties:
        period:
          type: string
          description: Metrics period
          example: "24h"
        latency:
          $ref: '#/components/schemas/LatencyMetrics'
        cache_hit:
          $ref: '#/components/schemas/CacheMetrics'
        error_rate:
          $ref: '#/components/schemas/ErrorMetrics'
        quota_usage:
          $ref: '#/components/schemas/QuotaMetrics'
        throughput:
          $ref: '#/components/schemas/ThroughputMetrics'

    LatencyMetrics:
      type: object
      properties:
        p50:
          type: number
          format: float
          description: 50th percentile latency (ms)
          example: 150.5
        p95:
          type: number
          format: float
          description: 95th percentile latency (ms)
          example: 500.0
        p99:
          type: number
          format: float
          description: 99th percentile latency (ms)
          example: 1000.0
        average:
          type: number
          format: float
          description: Average latency (ms)
          example: 200.0

    CacheMetrics:
      type: object
      properties:
        hit_rate:
          type: number
          format: float
          description: Cache hit rate percentage
          example: 85.5
        miss_rate:
          type: number
          format: float
          description: Cache miss rate percentage
          example: 14.5
        total_requests:
          type: integer
          description: Total cache requests
          example: 10000
        hit_count:
          type: integer
          description: Cache hits
          example: 8550
        miss_count:
          type: integer
          description: Cache misses
          example: 1450

    ErrorMetrics:
      type: object
      properties:
        total_requests:
          type: integer
          description: Total requests
          example: 10000
        error_count:
          type: integer
          description: Error count
          example: 50
        error_rate:
          type: number
          format: float
          description: Error rate percentage
          example: 0.5
        error_breakdown:
          type: object
          properties:
            "400":
              type: integer
              description: Bad request errors
              example: 20
            "401":
              type: integer
              description: Unauthorized errors
              example: 10
            "429":
              type: integer
              description: Rate limit errors
              example: 15
            "5xx":
              type: integer
              description: Server errors
              example: 5

    QuotaMetrics:
      type: object
      properties:
        total_quota:
          type: integer
          description: Total quota across all providers
          example: 50000
        used_quota:
          type: integer
          description: Used quota
          example: 25000
        remaining_quota:
          type: integer
          description: Remaining quota
          example: 25000
        quota_utilization:
          type: number
          format: float
          description: Quota utilization percentage
          example: 50.0

    ThroughputMetrics:
      type: object
      properties:
        requests_per_second:
          type: number
          format: float
          description: Average requests per second
          example: 10.5
        peak_rps:
          type: number
          format: float
          description: Peak requests per second
          example: 25.0
        total_requests:
          type: integer
          description: Total requests in period
          example: 900000

    AuditLog:
      type: object
      required: [id, action, user_id, timestamp, ip_address]
      properties:
        id:
          type: string
          description: Audit log ID
          example: "audit_123456789"
        action:
          type: string
          enum: [login, logout, api_access, data_export, admin_action]
          description: Action performed
          example: "api_access"
        user_id:
          type: string
          description: User ID
          example: "user_123456789"
        user_email:
          type: string
          format: email
          description: User email
          example: "user@example.com"
        resource:
          type: string
          description: Resource accessed
          example: "/api/v1/arbitrage"
        method:
          type: string
          description: HTTP method
          example: "GET"
        status_code:
          type: integer
          description: HTTP status code
          example: 200
        ip_address:
          type: string
          description: Client IP address
          example: "192.168.1.100"
        user_agent:
          type: string
          description: User agent string
          example: "Mozilla/5.0..."
        timestamp:
          type: string
          format: date-time
          description: Action timestamp
          example: "2025-01-11T10:30:00Z"
        metadata:
          type: object
          description: Additional metadata
          example: {"query_params": {"sport": "soccer_epl"}}

    Meta:
      type: object
      properties:
        limit:
          type: integer
          description: Number of results returned
          example: 50
        offset:
          type: integer
          description: Number of results skipped
          example: 0
        total:
          type: integer
          description: Total number of results available
          example: 150
        has_more:
          type: boolean
          description: Whether there are more results available
          example: true

    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          description: Error code
          example: "VALIDATION_ERROR"
        message:
          type: string
          description: Error message
          example: "Invalid sport key provided"
        details:
          type: object
          description: Additional error details
          example: {"field": "sport", "value": "invalid_sport"}
        timestamp:
          type: string
          format: date-time
          description: Error timestamp
          example: "2025-01-11T10:30:00Z"
        request_id:
          type: string
          description: Request ID for tracking
          example: "req_123456789"

  responses:
    ValidationError:
      description: Validation error
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                enum: [error]
              error:
                $ref: '#/components/schemas/Error'

    UnauthorizedError:
      description: Unauthorized access
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                enum: [error]
              error:
                $ref: '#/components/schemas/Error'

    ForbiddenError:
      description: Forbidden access
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                enum: [error]
              error:
                $ref: '#/components/schemas/Error'

    RateLimitError:
      description: Rate limit exceeded
      headers:
        Retry-After:
          description: Seconds to wait before retrying
          schema:
            type: integer
            example: 60
        X-RateLimit-Limit:
          description: Rate limit per window
          schema:
            type: integer
            example: 1000
        X-RateLimit-Remaining:
          description: Remaining requests in current window
          schema:
            type: integer
            example: 0
        X-RateLimit-Reset:
          description: Time when rate limit resets
          schema:
            type: integer
            example: 1640995200
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                enum: [error]
              error:
                $ref: '#/components/schemas/Error'

tags:
  - name: Sports
    description: Sports and leagues information
  - name: Odds
    description: Odds data and bookmaker information
  - name: Arbitrage
    description: Arbitrage opportunities and calculations
  - name: Export
    description: Data export functionality
  - name: User
    description: User profile and betting records
  - name: Admin
    description: Administrative functions and system management
```

---

## Rate Limiting

### Tier-based Limits

| Tier | Requests/Minute | Requests/Day | Export Limit/Day | API Key Required |
|------|----------------|--------------|------------------|------------------|
| **Free** | 60 | 1,000 | 5 | No |
| **Basic** | 300 | 10,000 | 50 | Yes |
| **Pro** | 1,000 | 100,000 | 500 | Yes |

### Rate Limit Headers

Minden API válasz tartalmazza a következő fejléceket:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "timestamp": "2025-01-11T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

---

## Authentication

### Supabase JWT Authentication

```bash
# Request with JWT token
curl -H "Authorization: Bearer <jwt_token>" \
     https://api.protipp.com/v1/user/profile
```

### API Key Authentication

```bash
# Request with API key
curl -H "X-API-Key: <api_key>" \
     https://api.protipp.com/v1/arbitrage
```

### Admin Authentication

Admin endpointokhoz külön admin JWT token szükséges admin jogosultságokkal.

---

## Error Handling

### Standard Error Response

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid sport key provided",
    "details": {
      "field": "sport",
      "value": "invalid_sport"
    },
    "timestamp": "2025-01-11T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Provider error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ProTippAPI } from '@protipp/api-client';

const api = new ProTippAPI({
  baseUrl: 'https://api.protipp.com/v1',
  apiKey: 'your_api_key'
});

// Get arbitrage opportunities
const opportunities = await api.arbitrage.getOpportunities({
  minProfit: 2.0,
  sport: 'soccer_epl',
  limit: 50
});

// Create betting record
const record = await api.user.createBettingRecord({
  opportunityId: 'arb_123456789',
  amount: 1000.0
});
```

### Python

```python
import protipp

client = protipp.Client(
    base_url='https://api.protipp.com/v1',
    api_key='your_api_key'
)

# Get odds data
odds = client.odds.get(
    sport='soccer_epl',
    market='h2h',
    limit=100
)

# Export data
export_data = client.export.get(
    format='csv',
    type='arbitrage',
    sport='soccer_epl'
)
```

### cURL Examples

```bash
# Get sports list
curl -X GET "https://api.protipp.com/v1/sports" \
     -H "Accept: application/json"

# Get arbitrage opportunities
curl -X GET "https://api.protipp.com/v1/arbitrage?min_profit=2.0&sport=soccer_epl" \
     -H "Authorization: Bearer <jwt_token>" \
     -H "Accept: application/json"

# Export data
curl -X GET "https://api.protipp.com/v1/export?format=csv&type=arbitrage" \
     -H "X-API-Key: <api_key>" \
     -H "Accept: text/csv"
```

---

## Webhooks

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `arbitrage.opportunity.created` | New arbitrage opportunity | ArbitrageOpportunity |
| `arbitrage.opportunity.expired` | Opportunity expired | ArbitrageOpportunity |
| `user.betting_record.created` | New betting record | BettingRecord |
| `user.betting_record.updated` | Betting record updated | BettingRecord |

### Webhook Configuration

```json
{
  "url": "https://your-app.com/webhooks/protipp",
  "events": ["arbitrage.opportunity.created"],
  "secret": "webhook_secret_key"
}
```

### Webhook Payload Example

```json
{
  "event": "arbitrage.opportunity.created",
  "timestamp": "2025-01-11T10:30:00Z",
  "data": {
    "id": "arb_123456789",
    "sport_key": "soccer_epl",
    "profit_margin": 5.2,
    "expires_at": "2025-01-15T14:45:00Z"
  }
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-11 | Initial API specification |

---

## Support

- **Email**: support@protipp.com
- **Documentation**: https://docs.protipp.com
- **Status Page**: https://status.protipp.com
- **GitHub**: https://github.com/protipp/api-examples
