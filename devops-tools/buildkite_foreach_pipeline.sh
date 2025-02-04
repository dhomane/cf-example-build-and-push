#!/usr/bin/env bash
#  vim:ts=4:sts=4:sw=4:et
#
#  Author: Hari Sekhon
#  Date: 2020-04-01 18:59:00 +0100 (Wed, 01 Apr 2020)
#
#  https://github.com/HariSekhon/DevOps-Bash-tools
#
#  License: see accompanying Hari Sekhon LICENSE file
#
#  If you're using my code you're welcome to connect with me on LinkedIn and optionally send me feedback to help steer this or other code I publish
#
#  https://www.linkedin.com/in/HariSekhon
#

set -euo pipefail
[ -n "${DEBUG:-}" ] && set -x
srcdir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
. "$srcdir/lib/utils.sh"

# used by usage() in lib/utils.sh
# shellcheck disable=SC2034
usage_description="
Run a command for each Buildkite pipeline

All arguments become the command template

The command template replaces the following for convenience in each iteration:

{organization}          => \$BUILDKITE_ORGANIZATION / \$BUILDKITE_USER
{pipeline}              => the pipeline name

eg.
    ${0##*/} echo user={user} name={name} pipeline={pipeline}
"

# shellcheck disable=SC2034
usage_args="[<command>]"

help_usage "$@"

min_args 1 "$@"

cmd_template="$*"

"$srcdir/buildkite_pipelines.sh" |
while read -r pipeline; do
    if [ -n "${NO_HEADING:-}" ]; then
        echo "# ============================================================================ #" >&2
        echo "# $pipeline" >&2
        echo "# ============================================================================ #" >&2
    fi
    cmd="$cmd_template"
    cmd="${cmd//\{pipeline\}/$pipeline}"
    eval "$cmd"
done
